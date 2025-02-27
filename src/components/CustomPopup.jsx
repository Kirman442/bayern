import { Popup } from 'react-map-gl/maplibre';

const isWithinBounds = (longitude, latitude) => {
    return (
        longitude >= -180 && longitude <= 180 &&
        latitude >= -90 && latitude <= 90
    );
};

const CustomPopup = ({ hoveredDistrict, selectedRegion }) => {
    if (!hoveredDistrict || !hoveredDistrict.geometry || !hoveredDistrict.geometry.coordinates) return null;

    // Проверяем, что hoveredDistrict относится к выбранному региону
    if (selectedRegion && hoveredDistrict.properties.id.slice(0, 3) !== selectedRegion.properties.id.slice(0, 3)) {
        return null;
    }

    const [longitude, latitude] = hoveredDistrict.geometry.coordinates[0][0];

    if (!isWithinBounds(longitude, latitude)) return null;

    return (
        <Popup
            longitude={longitude}
            latitude={latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            style={{ zIndex: 1000 }}
        >
            <div className="p-2 bg-white rounded shadow">
                <h3 className="font-semibold">{hoveredDistrict.properties.name}</h3>
                <p>Население: {hoveredDistrict.properties.population.toLocaleString()} чел.</p>
                <p>Площадь: {hoveredDistrict.properties.area.toFixed(2)} км²</p>
            </div>
        </Popup>
    );
};

export default CustomPopup;