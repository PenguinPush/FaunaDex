import React, { useEffect } from 'react';
import './Description.css';

const Description = ({ name, title, timesCaught, description, image, onBack }) => {
  return (
    <div className="pokemon-description-page">
      <button className="back-button" onClick={onBack}>← Back</button>

      <div className="pokemon-description">
        <h2 className="pokemon-name">{name}</h2>
        <div className="background-rectangle">
          
          <img src={image} alt={name} className="background-image" />
        
        </div>
        <div className="pokemon-caught-position">
          Caught: {timesCaught} time{timesCaught !== 1 ? 's' : ''}
        </div>
        <div className="Lgray-rectangle"></div>
        <div className="gray-rectangle"></div>
        
        <div className="pokemon-info">
          <p className="pokemon-title">{title}</p>
          <p className="pokemon-title">{description}</p>
        </div>
        
      </div>
    </div>
  );
};

export default Description;