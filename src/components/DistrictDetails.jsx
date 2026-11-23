import { formatArea, formatDensity, formatPeople } from '../map/format';

const DistrictDetails = ({ selectedDistrict, cityCount }) => {
    if (!selectedDistrict) return null;

    return (
        <div className="mt-4 p-3 bg-blue-100 rounded">
            <h3 className="text-lg font-semibold">{selectedDistrict.properties.name}</h3>
            <p className="text-base">Fläche: {formatArea(selectedDistrict.properties.area)}</p>
            <p className="text-base">Bevölkerung: {formatPeople(selectedDistrict.properties.population)}</p>
            <p className="text-base">Männer: {formatPeople(selectedDistrict.properties.population_man)}</p>
            <p className="text-base">Frauen: {formatPeople(selectedDistrict.properties.population_woman)}</p>
            <p className="text-base">Bevölkerungsdichte: {formatDensity(selectedDistrict.properties)}</p>
            {cityCount !== null && (
                <p className="text-base">Städte / Gemeinden: {cityCount}</p>
            )}
        </div>
    );
};

export default DistrictDetails;