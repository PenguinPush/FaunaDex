import React from 'react';
import './BottomImagePanel.css';
import catchButton from "./assets/catch_button.png"

const BottomImagePanel = ({ src, catchSuccess, setPage, onClick, takeImage, currentlyCatching }) => {
  return (
    <>
    <div className="bottom-image-panel" >
    {currentlyCatching ? 
      ( <>
          <p></p>
        </>
      )
        :  catchSuccess ? <p onClick={() => {setPage("dex")}}>Catch successful! Click to see it in your dex</p>
        : <><div className="red-rectangle"></div>
          <img src={catchButton} onClick={takeImage} className="middle-image" />
          <img src={src} onClick={onClick} className="bottom-image" /></>
    }

    </div>
    </>

  );
};

export default BottomImagePanel;
