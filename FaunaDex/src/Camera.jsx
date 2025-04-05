import React, { useEffect, useState, useRef } from 'react';
import './Camera.css';
import BottomImagePanel from './BottomImagePanel';
import dexbutton from "./assets/dexbutton.png"


const Camera = ({setPage}) => {
  const videoRef = useRef(null);
  const [isPicturing, setIsPicturing] = useState(false);
  const [currentlyCatching, setCurrentlyCatching] = useState(false);
  const [catchSuccess, setCatchSuccess] = useState(false);
  const [currentlyWaiting, setCurrentlyWaiting] = useState(false);
  const [catchFailed, setCatchFailed] = useState(false);
  const [animalCaught, setAnimalCaught] = useState("BUG");


  const canvasRef = useRef(null); // hidden canvas for capturing image


  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const capture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 or blob
    const imageBlob = await new Promise(resolve =>
      canvas.toBlob(resolve, 'image/jpeg')
    );
    setCurrentlyCatching(true);

    if (videoRef.current) {
      videoRef.current.pause();
    }

    // Call gyroscope function before doing this
    setCurrentlyWaiting(true);
    setCurrentlyCatching(false);

    await captureAndSend(imageBlob);
    setCurrentlyWaiting(false);    
    setCatchSuccess(true);
  }

  function playVideo(){
    if (videoRef.current) {
      videoRef.current.play();
    }
  }

  const captureAndSend = async (imageBlob) => {
    // Send to backend (example using fetch + FormData)
    const formData = new FormData();
    formData.append('image', imageBlob, 'snapshot.jpg');

    try {
      const response = await fetch('http://127.0.0.1:5050/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json()
        console.log(data.is_animal)
        console.log('Image uploaded successfully');
        if (!data.is_animal){
          setCatchFailed(true); // TODO: do this if the backend returns that its bad
        }
        else {
          setAnimalCaught(data.name);
        }
      

      } else {
        console.error('Upload failed');

      }
    } catch (error) {
      console.error('Error sending image to backend:', error);
    }
  };

  return (
    <>
    <div className="half-screen-camera">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
      />
    </div>
    <canvas ref={canvasRef} style={{ display: 'none' }} />

    <BottomImagePanel takeImage={ ()=>{
      capture();
    }} currentlyWaiting={currentlyWaiting} animalText={animalCaught} playVideo={playVideo} src={dexbutton} setCatchSuccess={setCatchSuccess} setCatchFailed={setCatchFailed} catchFailed={catchFailed} catchSuccess={catchSuccess} currentlyCatching={currentlyCatching} setPage={setPage} onClick={()=>{setPage("dex")}} />
    </>

  );
};

export default Camera;
