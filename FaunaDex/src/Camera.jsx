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
  const [animalCaught, setAnimalCaught] = useState("DEFAULT");
  const [accel, setAccel] = useState({ x: null, y: null, z: null });

  const canvasRef = useRef(null); // hidden canvas for capturing image

  // let gyroscope = new Gyroscope({ frequency: 60 });

  // gyroscope.addEventListener("reading", (e) => {
  //   console.log(`Angular velocity along the X-axis ${gyroscope.x}`);
  //   console.log(`Angular velocity along the Y-axis ${gyroscope.y}`);
  //   console.log(`Angular velocity along the Z-axis ${gyroscope.z}`);
  // });

  // gyroscope.start();

  function waitForGyroscope() {
    const accelerometer = new Accelerometer({ frequency: 60 });
    if (accelerometer == null){
      console.log("NO ACCEL")
      return;
    }
    console.log(accelerometer);
    var accelListener = accelerometer.addEventListener('reading', () => {
      setAccel({
        x: accelerometer.x,
        y: accelerometer.y,
        z: accelerometer.z
      });
    })
    accelerometer.start();
    console.log(accelerometer);


    return new Promise((resolve) => {
      var checkInterval = setInterval(()=>{

        // console.log("checking accelerometer");
        if (!accelerometer.activated || (accelerometer.x + accelerometer.y) > 10){
          clearInterval(checkInterval);
          removeEventListener(accelerometer, accelListener);
          resolve();
        }
      }, 100)
    });
  }

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
    await waitForGyroscope();

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
