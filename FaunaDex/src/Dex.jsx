import React from 'react';
import DexItem from './DexItem';
import './Dex.css';
import { useEffect, useState } from 'react';

const Dex = ({onBack, setPage, setPokemon}) => {
  // TODO: get this items array from MongoDB rather than hardcoding it
  const [items, setItems] = useState([]);

  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await fetch('https://fauna-dex-3f13cfbb2cab.herokuapp.com/get_dex');
    //     const result = await response.json();
    //     console.log(response);
    //     if (result.status === 'success') {
    //       setItems(result.data);
    //     } else {
    //       console.error('Failed to fetch data:', result.message);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   }
    // }
    const li = {
      "data": [
        {
          "_id": "67f16c09beeab7c5ea372cf7",
          "description": "The Red-browed Finch, *Neochmia temporalis*, is a small, colorful bird featuring a distinctive red brow and greenish body. It inhabits eastern Australia's grassy woodlands, dense undergrowth, and gardens, often forming flocks.",
          "first_caught_city": "Oakville",
          "first_caught_time": 1743889481,
          "image_path": "uploads\\20250405174432_snapshot.jpg",
          "image_path_nobg": "uploads\\20250405174432_snapshot.jpg",
          "name": "Red Browed Finch",
          "times_caught": 0,
          "type_1": "Normal",
          "type_2": "Flying"
        },
        {
          "_id": "67f16f91f56acaf77b60d444",
          "description": "The Scarlet Tanager, *Piranga olivacea*, is a striking songbird known for the male's vivid red plumage with black wings and tail during the breeding season. It inhabits deciduous and mixed forests in North America, migrating to South America for the winter.",
          "first_caught_city": "Oakville",
          "first_caught_time": 1743890385,
          "image_path": "uploads\\20250405175938_snapshot.jpg",
          "image_path_nobg": "uploads\\20250405175938_snapshot.jpg",
          "name": "Scarlet Tanager",
          "times_caught": 0,
          "type_1": "Flying",
          "type_2": "Fire"
        },
        {
          "_id": "67f1701cd0fcc477075b6c6d",
          "description": "The Leopard Cat (Prionailurus bengalensis) is a small, nocturnal wild feline with a slender body, distinctive spotted coat, and adept climbing skills. It inhabits diverse habitats across Asia, including forests, grasslands, and wetlands.",
          "first_caught_city": "Oakville",
          "first_caught_time": 1743890524,
          "image_path": "uploads\\20250405180156_snapshot.jpg",
          "image_path_nobg": "uploads\\20250405180156_snapshot.jpg",
          "name": "Leopard Cat",
          "times_caught": 3,
          "type_1": "Normal",
          "type_2": "Dark"
        }
      ],
      "status": "success"
    }
    setItems(li.data);
    }
  , [])

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
