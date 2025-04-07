import React, { useEffect, useState } from 'react';
import DexItem from './DexItem';
import './Dex.css';

const Dex = ({ onBack, setPage, setPokemon }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const response = await fetch('http://localhost:5050/get_dex');
        console.log("fetching");
        const result = await response.json();
        if (result.status === 'success') {
          setItems(result.data);
        } else {
          console.error('Failed to fetch data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleItemClick = (name) => {
    setPage("description");
  };

  return (
    <>
    <button className="back-button" onClick={onBack}>← Back</button>
    <div className="dex-container">
      <div className="dex-grid">
        {items.map((item, index) => (
          <DexItem
            key={index}
            image={"http://localhost:5050/" + item.image_path}
            name={item.name}
            onClick={() => {
              handleItemClick(item.name);
              setPokemon(item);
            }}
          />
        ))}
      </div>
      </div>
    </>
  );
};

export default Dex;
