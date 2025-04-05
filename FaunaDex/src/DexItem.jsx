import React from 'react';
import './DexItem.css';

const DexItem = ({ image, name, onClick }) => {
  return (
    <div className="dex-item" onClick={onClick}>
      <img src={image} alt={name} className="dex-image darken-image" />
      <div className="dex-name">{name}</div>
    </div>
  );
};

export default DexItem;
