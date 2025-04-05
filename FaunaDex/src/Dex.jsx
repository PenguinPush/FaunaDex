import React from 'react';
import DexItem from './DexItem';
import './Dex.css';

const Dex = (onBack) => {
  const items = [
    { name: 'Bulbasaur', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
    { name: 'Charmander', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
    { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    { name: 'Squirtle', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },

    // Add more items as needed
  ];

  const handleItemClick = (name) => {
    console.log(`Clicked on ${name}`);
  };

  return (
    <div className="dex-container">
      <button className="back-button" onClick={onBack}>← Back</button>
      <div className="dex-grid">
        {items.map((item, index) => (
          <DexItem
            key={index}
            image={item.image}
            name={item.name}
            onClick={() => handleItemClick(item.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dex;
