import React from 'react';
import './BottomImagePanel.css';
import catchButton from "./assets/catch_button.png";

const BottomImagePanel = ({
  animalText,
  src,
  playVideo,
  currentlyWaiting,
  setCatchSuccess,
  setCatchFailed,
  catchFailed,
  catchSuccess,
  setPage,
  onClick,
  takeImage,
  currentlyCatching
}) => {
  return (
    <div className="bottom-image-panel">
      {currentlyCatching ? (
        <>
          <p className="white-text">Swing your phone FAST to catch!</p>
          <div className="shading-panel"></div>
        </>
      ) : currentlyWaiting ? (
        <>
          <p className="white-text">Waiting for backend server...</p>
          <div className="shading-panel"></div>
        </>
      ) : catchFailed ? (
        <>
          <p className="white-text" onClick={() => { setCatchSuccess(false); setCatchFailed(false); playVideo(); }}>
            Catch failed! There is no animal in the picture. Click here to continue.
          </p>
          <div className="shading-panel"></div>
        </>
      ) : catchSuccess ? (
        <>
          <p className="white-text" onClick={() => { setPage("dex"); setCatchSuccess(false); setCatchFailed(false); playVideo(); }}>
            Success! {animalText} has been caught. Click here to see it in your dex.
          </p>
          <div className="shading-panel"></div>
        </>
      ) : (
        <>
          <div className="shading-panel"></div>
          <img src={catchButton} onClick={takeImage} className="middle-image" alt="catch button" />
          <img src={src} onClick={onClick} className="bottom-image" alt="bottom" />
        </>
      )}
    </div>
  );
};

export default BottomImagePanel;
