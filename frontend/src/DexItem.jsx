import React from 'react';

const DexItem = ({image, name, onClick}) => {
    return (<div
        className="text-center cursor-pointer bg-gray-100 rounded-lg overflow-hidden"
        onClick={onClick}
    >
        <div className="h-48 w-full overflow-hidden" style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>

        </div>
        <div className="text-lg font-bold text-black capitalize py-1">
            {name}
        </div>
    </div>);
};

export default DexItem;
