import React from 'react';

const DistrictDetails = ({ selectedDistrict, currentCities }) => {
    if (!selectedDistrict) return null;

    return (
        <div className="mt-4 p-3 bg-blue-100 rounded">
            <h3 className="text-lg font-semibold">{selectedDistrict.properties.name}</h3>
            <p className="text-base">Fläche: {selectedDistrict.properties.area.toFixed(2)} km²</p>
            <p className="text-base">Bevölkerung: {selectedDistrict.properties.population.toLocaleString()} Einw.</p>
            <p className="text-base">Männer: {selectedDistrict.properties.population_man.toLocaleString()} Einw.</p>
            <p className="text-base">Frauen: {selectedDistrict.properties.population_woman.toLocaleString()} Einw.</p>
            <p className="text-base">Bevölkerungsdichte: {(selectedDistrict.properties.population / selectedDistrict.properties.area).toFixed(1)} Einw/km²</p>
            {currentCities && ( // <---- УСЛОВНАЯ отрисовка, чтобы не было ошибки, если currentCities вдруг undefined
                <p className="text-base">Städte / Gemeinden: {currentCities.length}</p>  //{/* <---- ОТОБРАЖАЕМ количество городов */}
            )}
        </div>
    );
};

export default DistrictDetails;