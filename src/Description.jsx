import React from 'react';
import './Description.css';

const Description = ({ name, title, timesCaught, description, image, onBack }) => {
  return (
    <div className="pokemon-description-page">
      <button className="back-button" onClick={onBack}>← Back</button>

      <div className="pokemon-description">
        <img src={image} alt={name} className="pokemon-image" />
        <div className="pokemon-info">
          <h2 className="pokemon-name">{name}</h2>
          <p className="pokemon-title">{title}</p>
          <p className="pokemon-caught">Caught: {timesCaught} time{timesCaught !== 1 ? 's' : ''}</p>
          <p className="pokemon-title">{description}</p>

        </div>
      </div>
    </div>
  );
};

export default Description;
