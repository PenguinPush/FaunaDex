import React from 'react';
import './BottomImagePanel.css';
import catchButton from "./assets/catch_button.png"

const BottomImagePanel = ({ src, currentlyWaiting, setCatchSuccess, setCatchFailed, catchFailed, catchSuccess, setPage, onClick, takeImage, currentlyCatching }) => {
  return (
    <>
    <div className="bottom-image-panel" >
    {currentlyCatching ? 
      ( <>
          <p>Move your joystick etc</p>
        </>
      )
        : currentlyWaiting ? <p>Waiting for backend server...</p>
        : catchFailed ? <p onClick={() => {setCatchSuccess(false); setCatchFailed(false)}}>Catch failed! There is no animal in the picture</p>
        :  catchSuccess ? <p onClick={() => {setPage("dex"); setCatchSuccess(false); setCatchFailed(false)}}>Catch successful! Click to see it in your dex</p>
        : <><div className="red-rectangle"></div>
          <img src={catchButton} onClick={takeImage} className="middle-image" />
          <img src={src} onClick={onClick} className="bottom-image" /></>
    }

    </div>
    </>

  );
};

export default BottomImagePanel;
