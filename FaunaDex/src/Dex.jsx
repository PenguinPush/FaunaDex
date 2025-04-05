import React from 'react';
import DexItem from './DexItem';
import './Dex.css';

const Dex = ({onBack, setPage, setPokemon}) => {
  // TODO: get this items array from MongoDB rather than hardcoding it
  const items = [
    { 
      name: 'Bulbasaur', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      timesCaught: 0,
      description: "the cutest"
    },
    { 
      name: 'Charmander', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      timesCaught: 0,
      description: "the cutest"
    },
    { 
      name: 'Squirtle', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
      timesCaught: 0,
      description: "the cutest"
    },
    { 
      name: 'Bulbasaur', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      timesCaught: 0,
      description: "the cutest"
    },
    { 
      name: 'Charmander', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      timesCaught: 0,
      description: "the cutest"
    },
    { 
      name: 'Squirtle', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
      timesCaught: 0,
      description: "the cutest"
    },
    { 
      name: 'Bulbasaur', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
      timesCaught: 0,
      description: "the cutest"
    },
    { 
      name: 'Charmander', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
      timesCaught: 0,
      description: "the cutest"
    },
    { 
      name: 'Squirtle', 
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
      timesCaught: 0,
      description: "the cutest"
    },


    // Add more items as needed
  ];

  const handleItemClick = (name) => {
    setPage("description");
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
            onClick={() => {
              handleItemClick(item.name)
              setPokemon(item);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Dex;
