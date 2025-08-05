import React from 'react';

const DexItem = ({image, name, onClick}) => {
    return (<div
            className="text-center cursor-pointer bg-gray-100 rounded-lg"
            onClick={onClick}
        >
            <img
                src={image}
                alt={name}
                className="w-full h-auto object-contain mb-2"
            />
            <div className="text-lg font-bold text-gray-800 capitalize">
                {name}
            </div>
        </div>);
};

export default DexItem;
