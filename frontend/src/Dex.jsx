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


    return (<div className="bg-white/90 w-full h-full overflow-y-scroll flex flex-col items-center p-4">
        <button
            className="text-lg font-bold text-blue-500 hover:text-blue-700 mb-4"
            onClick={onBack}
        >
            ← Back
        </button>
        <div className="w-full h-full rounded-lg">
            <div
                className="grid w-full grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-4 gap-y-3">
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
