import React from 'react';
import DexItem from './DexItem';
import './Dex.css';
import { useEffect, useState } from 'react';

const Dex = ({onBack, setPage, setPokemon}) => {
  // TODO: get this items array from MongoDB rather than hardcoding it
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems([
      {name: "squirtle",
       image: "uploads/20250405173140_snapshot.jpg"
      }
    ])
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch('http://127.0.0.1:5050/get_dex');
    //     const result = await response.json();
    //     if (result.status === 'success') {
    //       setItems(result.data);
    //     } else {
    //       console.error('Failed to fetch data:', result.message);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // };

    // fetchData();
  }, []);

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
            image={"http://127.0.0.1:5050/" + item.image_path}
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
