import React from 'react';
import './BottomImagePanel.css';
import catchButton from "./assets/catch_button.png"

const BottomImagePanel = ({ src, onClick, takeImage, currentlyCatching }) => {
  return (
    <>
    <div className="bottom-image-panel" >
    {currentlyCatching ? 
      ( <>
        
        </>
      )
        :  <><div className="red-rectangle"></div>
          <img src={catchButton} onClick={takeImage} className="middle-image" />
          <img src={src} onClick={onClick} className="bottom-image" /></>
    }

    </div>
    </>

  );
};

export default BottomImagePanel;
