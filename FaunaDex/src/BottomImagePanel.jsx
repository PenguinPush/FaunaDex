import React, { useEffect, useState } from 'react';
import './BottomImagePanel.css';
import catchButton from "./assets/catch_button.png";

const BottomImagePanel = ({ src, catchSuccess, setPage, onClick, takeImage, currentlyCatching }) => {
  const [fadeMessage, setFadeMessage] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeMessage((prev) => !prev);
    }, 5000); // Toggle visibility every 5 seconds
    return () => clearInterval(interval); // Cleanup the interval when the component unmounts
  }, []);

  return (
    <>
      <div className="bottom-image-panel">
        {currentlyCatching ? (
          <>
            <p className={`fade-message ${fadeMessage ? 'visible' : ''}`}>
              Swing your phone FAST to catch!
            </p>
          </>
        ) : catchSuccess ? (
          <p onClick={() => { setPage("dex"); }}>
            Catch successful! Click to see it in your dex
          </p>
        ) : (
          <>
            <div className="red-rectangle"></div>
            <img src={catchButton} onClick={takeImage} className="middle-image" />
            <img src={src} onClick={onClick} className="bottom-image" />
          </>
        )}
      </div>
    </>
  );
};

export default BottomImagePanel;
