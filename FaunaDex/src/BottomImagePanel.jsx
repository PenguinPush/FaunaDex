import React, { useEffect, useState } from 'react';
import './BottomImagePanel.css';
import catchButton from "./assets/catch_button.png";

const BottomImagePanel = ({ animalText, src, playVideo, currentlyWaiting, setCatchSuccess, setCatchFailed, catchFailed, catchSuccess, setPage, onClick, takeImage, currentlyCatching }) => {
  return (
    <>
      <div className="bottom-image-panel">
        {currentlyCatching ? (
          <>
          <p className="info-text">
            Swing your phone FAST to catch!
          </p>
          <div className="big-white-rectangle"></div>
          </>
        ) :  
        currentlyWaiting ? 
        (
          <>
          <p className="info-text">Waiting for backend server...</p> 
          <div className="big-white-rectangle"></div>

          </>
        )
        : catchFailed ? (
          <>
          <p className="info-text" onClick={() => { setCatchSuccess(false); setCatchFailed(false); playVideo()}}>
            Catch failed! There is no animal in the picture. Click here to continue.
          </p>
          <div className="big-white-rectangle"></div>
          </>
        ) : catchSuccess ? (
          <>
          <p className="info-text" onClick={() => { setPage("dex"); setCatchSuccess(false); setCatchFailed(false); playVideo()}}>
            Success! {animalText} has been caught. Click here to see it in your dex.
          </p>
          <div className="big-white-rectangle"></div>
          </>
        ) : (
          <>
            <div className="red-rectangle"></div>
            <div className="white-rectangle"></div>
            <img src={catchButton} onClick={takeImage} className="middle-image" />
            <img src={src} onClick={onClick} className="bottom-image" />
          </>
        )}
      </div>
    </>
  );
};

export default BottomImagePanel;
