import React from 'react';
import DexItem from './DexItem';
import './Dex.css';
import { useEffect, useState } from 'react';

const Dex = ({onBack, setPage, setPokemon}) => {
  // TODO: get this items array from MongoDB rather than hardcoding it
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("fetching");

        const response = await fetch('https://fauna-dex-3f13cfbb2cab.herokuapp.com/get_dex');
        console.log("fetching");

        const result = await response.json();
        console.log(response);
        if (result.status === 'success') {
          setItems(result.data);
        } else {
          console.error('Failed to fetch data:', result.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();   
    }
  ,[])

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
            image={"https://fauna-dex-3f13cfbb2cab.herokuapp.com/" + item.image_path}
            name={item.name}
            onClick={() => {
              handleItemClick(item.name)
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
