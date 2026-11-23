import { formatArea, formatDensity, formatPeople } from '../map/format';

const CityDetails = ({ city }) => {
    if (!city) return null;

    return (
        <div className="mb-2 p-3 bg-blue-100 rounded">
            <h3 className="text-lg font-semibold">{city.properties.name}</h3>
            <p className="text-base">Fläche: {formatArea(city.properties.area)}</p>
            <p className="text-base">Bevölkerung: {formatPeople(city.properties.population)}</p>
            <p className="text-base">Männer: {formatPeople(city.properties.population_man)}</p>
            <p className="text-base">Frauen: {formatPeople(city.properties.population_woman)}</p>
            <p className="text-base">Bevölkerungsdichte: {formatDensity(city.properties)}</p>
        </div>
    );
};

export default CityDetails;