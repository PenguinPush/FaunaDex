import React, {useEffect, useState} from 'react';
import DexItem from './DexItem';

const Dex = ({onBack, setPage, setPokemon}) => {
    const [dexEntries, setDexEntries] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5050/get_dex');
                console.log("fetching");
                const result = await response.json();
                if (result.status === 'success') {
                    setDexEntries(result.data);
                } else {
                    console.error('Failed to fetch data:', result.message);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);


    return (<div className="bg-white/90 w-full h-full">
        <button
            className="absolute top-6 left-6 bg-yellow-400 border-none text-lg px-4 py-2 rounded-md cursor-pointer transition-colors duration-300 hover:bg-yellow-300"
            onClick={onBack}
        >
            ← Back
        </button>
        <div className="w-full h-full rounded-lg">
            <div
                className="grid w-full grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-4">
                {dexEntries.map((entry, index) => (
                    <DexItem
                        key={index}
                        image={"http://localhost:5050/" + entry.image_path}
                        name={entry.name}
                        onClick={() => {
                            setPage("description");
                            setPokemon(entry);
                        }}
                    />))}
            </div>
        </div>
    </div>);
};

export default Dex;
