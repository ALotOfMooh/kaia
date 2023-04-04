import React, { useRef, useEffect, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import './App.css'

function App() {
  const videoRef = useRef(null);
  const [predictions1, setPredictions1] = useState([]);
  const [predictions2, setPredictions2] = useState([]);
  const [predictions3, setPredictions3] = useState([]);
  const [predictions4, setPredictions4] = useState([]);
  let model1, model2, model3, model4;
  let maxPredictions1, maxPredictions2, maxPredictions3, maxPredictions4;
  const [isPaused, setIsPaused] = useState(false);

  const [uploadedImage, setUploadedImage] = useState(null);


  // const handleDrop = (event) => {
  //   event.preventDefault();
  //   const file = event.dataTransfer.files[0];
  //   const reader = new FileReader();s
  //   reader.onload = () => {
  //     setUploadedImage(reader.result);
  //     if (videoRef.current) {
  //       videoRef.current.pause();
  //       setIsPaused(true);
  //     }
  //   };
  //   reader.readAsDataURL(file);
  // };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(img, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        setUploadedImage(canvas.toDataURL());
        if (videoRef.current) {
          //videoRef.current.srcObject = null;
          //videoRef.current.src = '';
          videoRef.current.pause();
        }
        setIsPaused(true);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };
  const URL1 = "https://teachablemachine.withgoogle.com/models/mj3cgAzZF/";
  const URL2 = "https://teachablemachine.withgoogle.com/models/CCBURTp5B/";
  const URL3 = "https://teachablemachine.withgoogle.com/models/tm538U1GF/";
  const URL4 = "https://teachablemachine.withgoogle.com/models/cT2qmxX6w/";

  const loadModel = async () => {
    const modelURL1 = URL1 + "model.json";
    const metadataURL1 = URL1 + "metadata.json";
    const modelURL2 = URL2 + "model.json";
    const metadataURL2 = URL2 + "metadata.json";
    const modelURL3 = URL3 + "model.json";
    const metadataURL3 = URL3 + "metadata.json";
    const modelURL4 = URL4 + "model.json";
    const metadataURL4 = URL4 + "metadata.json";
    const modelUrl = "./gruppe1/model.json"
    const metadataUrl = './gruppe1/metadata.json';
    const weightsUrl = './gruppe1/weights.bin';

    model1 = await tmImage.load(modelURL1, metadataURL1);
    model2 = await tmImage.load(modelURL2, metadataURL2);
    model3 = await tmImage.load(modelURL3, metadataURL3);
    model4 = await tmImage.load(modelURL4, metadataURL4);
    //model = await tmImage.load(modelUrl, metadataUrl, weightsUrl);
    //model1 = await tmImage.loadFromFiles(modelUrl, weightsUrl, metadataUrl);
    maxPredictions1 = model1.getTotalClasses();
    maxPredictions2 = model2.getTotalClasses();
    maxPredictions3 = model3.getTotalClasses();
    maxPredictions4 = model4.getTotalClasses();
  };

  const predict = async () => {
    // Check if the models are loaded
    if (!model1 || !model2 || !model3 || !model4) return;

    // Get the current video frame
    const image = videoRef.current;
    console.log(videoRef.current)
    // Make predictions using each model
    const prediction1 = await model1.predict(image);
    const prediction2 = await model2.predict(image);
    const prediction3 = await model3.predict(image);
    const prediction4 = await model4.predict(image);

    // Sort the predictions by probability in descending order
    prediction1.sort((a, b) => (a.probability < b.probability) ? 1 : -1);
    prediction2.sort((a, b) => (a.probability < b.probability) ? 1 : -1);
    prediction3.sort((a, b) => (a.probability < b.probability) ? 1 : -1);
    prediction4.sort((a, b) => (a.probability < b.probability) ? 1 : -1);

    // Set the state with the prediction results
    setPredictions1(prediction1);
    setPredictions2(prediction2);
    setPredictions3(prediction3);
    setPredictions4(prediction4);
  };

  useEffect(() => {
    // Load the Teachable Machine model
    loadModel();

    // Start making predictions every 0.1 seconds
    const intervalId = setInterval(predict, 100);

    // Cleanup function to stop the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
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

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    if (videoRef.current.paused) {
      //   setUploadedImage(null);
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  // {uploadedImage ? (
  //   <img src={uploadedImage} alt="Uploaded" />
  // ) : (
  //   <video ref={videoRef} autoPlay />
  // )}
  // {uploadedImage && (
  //   <img src={uploadedImage} alt="Uploaded" />
  // )}


  return (
    <div>
      <div className="video-container" onDrop={handleDrop} onDragOver={(event) => event.preventDefault()}>

        {uploadedImage ? (
          <img src={uploadedImage} alt="Uploaded" />
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

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Model 1 Predictions</h2>
          {predictions1.map((prediction1) => (
            <div key={prediction1.className} className={prediction1.probability === Math.max(...predictions1.map(p => p.probability)) ? 'highlight' : ''}>
              {prediction1.className}: {prediction1.probability.toFixed(2)}
            </div>
          ))}
        </div>
        <div>
          <h2>Model 2 Predictions</h2>
          {predictions2.map((prediction2) => (
            <div key={prediction2.className} className={prediction2.probability === Math.max(...predictions2.map(p => p.probability)) ? 'highlight' : ''}>
              {prediction2.className}: {prediction2.probability.toFixed(2)}
            </div>
          ))}
        </div>
        <div>
          <h2>Model 3 Predictions</h2>
          {predictions3.map((prediction3) => (
            <div key={prediction3.className} className={prediction3.probability === Math.max(...predictions3.map(p => p.probability)) ? 'highlight' : ''}>
              {prediction3.className}: {prediction3.probability.toFixed(2)}
            </div>
          ))}
        </div>
        <div>
          <h2>Model 4 Predictions</h2>
          {predictions4.map((prediction4) => (
            <div key={prediction4.className} className={prediction4.probability === Math.max(...predictions4.map(p => p.probability)) ? 'highlight' : ''}>
              {prediction4.className}: {prediction4.probability.toFixed(2)}
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}

export default App;
