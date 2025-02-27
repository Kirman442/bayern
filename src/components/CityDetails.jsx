import React from 'react';

const CityDetails = ({ selectedCityInDistrict }) => {
    // if (!selectedCityInDistrict) return null;
    // Проверяем, что selectedCityInDistrict является городом
    if (!selectedCityInDistrict || !selectedCityInDistrict.properties || !selectedCityInDistrict.properties['land-id']) {
        return null; // Если это не город, ничего не отображаем
    }

    return (
        <div className="mb-2 p-3 bg-blue-100 rounded">
            <h3 className="text-lg font-semibold">{selectedCityInDistrict.properties.name}</h3>
            <p className="text-base">Fläche: {selectedCityInDistrict.properties.area.toFixed(2)} km²</p>
            <p className="text-base">Bevölkerung: {selectedCityInDistrict.properties.population.toLocaleString()} Einw.</p>
            <p className="text-base">Männer: {selectedCityInDistrict.properties.population_man.toLocaleString()} Einw.</p>
            <p className="text-base">Frauen: {selectedCityInDistrict.properties.population_woman.toLocaleString()} Einw.</p>
            <p className="text-base">Bevölkerungsdichte: {(selectedCityInDistrict.properties.population / selectedCityInDistrict.properties.area).toFixed(1)} Einw/km²</p>
        </div>
    );
};

export default CityDetails;