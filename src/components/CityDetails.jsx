const CityDetails = ({ city }) => {
    if (!city) return null;

    return (
        <div className="mb-2 p-3 bg-blue-100 rounded">
            <h3 className="text-lg font-semibold">{city.properties.name}</h3>
            <p className="text-base">Fläche: {city.properties.area.toFixed(2)} km²</p>
            <p className="text-base">Bevölkerung: {city.properties.population.toLocaleString()} Einw.</p>
            <p className="text-base">Männer: {city.properties.population_man.toLocaleString()} Einw.</p>
            <p className="text-base">Frauen: {city.properties.population_woman.toLocaleString()} Einw.</p>
            <p className="text-base">Bevölkerungsdichte: {(city.properties.population / city.properties.area).toFixed(1)} Einw/km²</p>
        </div>
    );
};

export default CityDetails;