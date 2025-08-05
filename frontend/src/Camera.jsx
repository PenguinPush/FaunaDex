import React, {useEffect, useState, useRef} from 'react';
import dexButton from "./assets/button_dex.png";
import catchButton from "./assets/button_catch.png";

const Camera = ({setPage}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [catchState, setCatchState] = useState(0);
    const [animalCaught, setAnimalCaught] = useState("DEFAULT");

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({video: true});
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

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        setCatchState(1);

        if (videoRef.current) {
            videoRef.current.pause();
        }

        await captureAndSend(imageBlob);
    };

    const captureAndSend = async (imageBlob) => {
        const formData = new FormData();
        formData.append('image', imageBlob, 'snapshot.jpg');

        try {
            const response = await fetch('http://localhost:5050/upload', {
                method: 'POST', body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (!data.is_animal) {
                    setCatchState(4);
                } else {
                    setCatchState(3);
                    setAnimalCaught(data.name);
                }
            } else {
                console.error('Upload failed');
            }
        } catch (error) {
            console.error('Error sending image to backend:', error);
        }
    };

    const StatusPanel = ({catchState}) => {
        const messages = ["", "Swing your phone FAST to catch!", "Waiting for backend server...", "", "Catch failed! There is no animal in the picture. Click here to continue."];

        return (<>
            <div
                className="flex w-full h-full text-2xl text-center font-pixelify items-center text-white justify-center flex-col px-16"
                onClick={() => {
                    if (catchState === 3) setPage("dex");
                    else if (catchState === 1) setCatchState(2);
                    else setCatchState(0);
                    videoRef.current?.play();
                }}
            >
                <p className="flex">
                    {catchState === 3 ? `Success! ${animalCaught} has been caught. Click here to see it in your dex.` : messages[catchState]}
                </p>
            </div>
        </>);
    };

    return (<>

        <div
            className="relative w-full h-[50vh] overflow-hidden bg-black inset-0 border-4 border-black box-border">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
            />
        </div>
        <canvas ref={canvasRef} className="hidden"/>
        <div
            className="relative h-[50vh] w-full flex flex-col justify-end items-center bg-transparent absolute bottom-0">
            {catchState !== 0 ? (<StatusPanel
                catchState={catchState}
            />) : (<>
                <img
                    src={catchButton}
                    onClick={capture}
                    className="h-auto max-h-[75%] w-auto max-w-[75%] object-contain absolute top-1/2 left-[51%] transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    alt="catch button"
                />
                <img
                    src={dexButton}
                    onClick={() => setPage("dex")}
                    className="h-auto max-h-[50%] w-auto max-w-[50%] object-contain absolute bottom-0 left-1/2 transform -translate-x-1/2 cursor-pointer"
                    alt="dex button"
                />
            </>)}
            <div
                className="h-full w-full bg-cover bg-center-top border-4 border-black absolute top-0 z-[-1]"
                style={{
                    backgroundImage: "url('src/assets/camera_background.png')", backgroundPosition: "center"
                }}
            ></div>
        </div>

    </>);
}

export default Camera;
