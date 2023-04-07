import React, { useRef, useEffect, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import './App.css'
let maxPredictions = [];
let models = [];
let modelNames = [] // this should be used to set the names of the models and then use them in the html
const modelURLs = [
  "https://teachablemachine.withgoogle.com/models/mj3cgAzZF/",
  "https://teachablemachine.withgoogle.com/models/CCBURTp5B/",
  "https://teachablemachine.withgoogle.com/models/tm538U1GF/",
  "https://teachablemachine.withgoogle.com/models/cT2qmxX6w/",
  "https://teachablemachine.withgoogle.com/models/cT2qmxX6w/",
  "https://teachablemachine.withgoogle.com/models/cT2qmxX6w/",
  "https://teachablemachine.withgoogle.com/models/mj3cgAzZF/",
];

function App() {

  console.log("app");
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const loadModel = async () => {
    for (let i = 0; i < modelURLs.length; i++) {
      const model = await tmImage.load(modelURLs[i] + "model.json", modelURLs[i] + "metadata.json");
      models.push(model);
      maxPredictions.push(model.getTotalClasses());
    }
    //model1 = await tmImage.loadFromFiles(modelUrl, weightsUrl, metadataUrl);
  };

  const predict = async () => {
    // Check if the models are loaded
    if (models.some(model => !model)) return;
    let image;
    if (imgRef.current) {
      image = imgRef.current
    } else {
      // Get the current video frame
      image = videoRef.current;
    }
    const predictions = [];
    // Sort the predictions by probability in descending order
    for (let i = 0; i < models.length; i++) {
      const prediction = await models[i].predict(image);
      prediction.sort((a, b) => (a.probability < b.probability) ? 1 : -1);
      predictions.push(prediction);
    }
    setPredictions(predictions);
  };

  useEffect(() => {
    // Load the Teachable Machine model
    loadModel();
    console.log("load models");

    // Start making predictions every 0.1 seconds
    const intervalId = setInterval(predict, 100);

    // Cleanup function to stop the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    console.log("media init");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => console.error(error));
    }
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const aspectRatio = img.width / img.height;
        canvas.height = videoRef.current ? videoRef.current.videoHeight : imgRef.current.height;
        canvas.width = videoRef.current ? videoRef.current.videoHeight * aspectRatio : imgRef.current.height * aspectRatio;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUploadedImage(canvas.toDataURL());
        setIsPaused(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    setUploadedImage(null);
    if (isPaused) {
      console.log(videoRef);
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }).catch((error) => console.error(error));
      console.log(videoRef);
      //videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', fontSize: '48px', margin: '20px 0' }}>Kaia - Ueberschrift</h1>
      <div className="video-container" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>
        {uploadedImage ? (
          <img ref={imgRef} src={uploadedImage} alt="Uploaded" />
        ) : (
          <video ref={videoRef} autoPlay />
        )}
        <div className="video-wrapper"></div>
      </div>
      <div className="video-container">
        <button onClick={handleTogglePause}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {predictions.map((prediction, index) => (
          <div key={`model-${index + 1}`} style={{ marginBottom: '20px', width: 'calc(100% / 4 - 20px)' }}>
            <h2>Model {index + 1} Predictions</h2>
            {prediction.map((item) => (
              <div
                key={item.className}
                className={
                  item.probability === Math.max(...prediction.map((p) => p.probability))
                    ? 'highlight'
                    : ''
                }
              >
                {item.className}: {item.probability.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>

    </div >
  );
}

export default App;
