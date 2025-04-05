import React from 'react';
import './BottomImagePanel.css';

const BottomImagePanel = ({ src, onClick }) => {
  return (
    <div className="bottom-image-panel" onClick={onClick}>
      <img src={src} className="bottom-image" />
    </div>
  );
};

export default BottomImagePanel;
