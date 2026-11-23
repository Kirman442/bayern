import ColorLegend from './ColorLegend';
import CityCirclesLegend from './CityCirclesLegend';

const RegionDetails = ({ selectedRegion, districts, cities, onDistrictClick, setSelectedDistrictCityInfo, selectedDistrictCityInfo, setSelectedRegionInfo, colorScale, currentCities, handleTabClick }) => {
    if (!selectedRegion) return null;


    const handleDistrictClick = (district) => {
        onDistrictClick(district); // Передаём выбранный район в родительский компонент
    };
    const handleSwitchToDistrictsTab = () => {
        handleTabClick('districts'); // Переключаем на вкладку "Края"
    };

    return (
        <div className="mb-4">
            {/* Информация о выбранной области */}
            <div className="p-3 bg-blue-100 rounded">
                <h3 className="text-lg font-semibold">{selectedRegion.properties.name}</h3>
                <p className="text-base">Bevölkerung: {selectedRegion.properties.population.toLocaleString()} Einw.</p>
                <p className="text-base">Fläche: {selectedRegion.properties.area.toFixed(2)} km²</p>
                <p className="text-base">Bevölkerungsdichte: {(selectedRegion.properties.population / selectedRegion.properties.area).toFixed(1)} Einw/km²</p>
                <h4 className="text-base font-semibold">Als Teil des Bezirks:</h4>
                <p className="text-base">Kreisfreiestädte: {cities.length}</p>
                <p className="text-base">Landkreise: {districts.length}</p>
                {currentCities && (
                    <p className="text-base">Städte / Gemeinde: {currentCities.length}</p>
                )}

                <ColorLegend colorScale={colorScale} />
                <CityCirclesLegend />
            </div>

            {/* Список краёв и независимых городов */}
            <div className="mt-2">
                <div className="scrollable-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <h5 className="font-semibold mt-2">🏞️ Landkreise:</h5>
                    <ul className="space-y-2">
                        {districts.map(district => (
                            <li key={district.properties.id}>
                                <div
                                    className={`p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 scrollable-list-item 
                                        ${selectedDistrictCityInfo?.properties.id === district.properties.id ? 'bg-teal-100 font-bold' : ''}`}
                                    onClick={() => {
                                        handleDistrictClick(district);
                                        setSelectedDistrictCityInfo(district);
                                        setSelectedRegionInfo(null);
                                    }}
                                >
                                    <p>{district.properties.name}</p>
                                    <p>Bevölkerung: {district.properties.population.toLocaleString()} Einw.</p>
                                    <p>Fläche: {district.properties.area.toFixed(2)} km²</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <h5 className="font-semibold mt-2">🏙️ Kreisfreiestädte:</h5>
                    <ul className="space-y-2">
                        {cities.map(city => (
                            <li key={city.properties.id}>
                                <div
                                    className={`p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 scrollable-list-item 
                                        ${selectedDistrictCityInfo?.properties.id === city.properties.id ? 'bg-teal-100 font-bold' : ''}`}
                                    onClick={() => {
                                        handleDistrictClick(city);
                                        setSelectedDistrictCityInfo(city);
                                        setSelectedRegionInfo(null);
                                    }}
                                >
                                    <p>{city.properties.name}</p>
                                    <p>Bevölkerung: {city.properties.population.toLocaleString()} Einw.</p>
                                    <p>Fläche: {city.properties.area.toFixed(2)} km²</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="region-tab-content p-2 text-center"> {/* Центрируем текст */}
                <h5 className="font-semibold mt-2">
                    <p
                        onClick={handleSwitchToDistrictsTab}
                        className="text-base cursor-pointer underline text-[#253494] hover:text-[#0C1130] transition-colors duration-200"
                    >
                        Hier klicken für weitere Informationen
                    </p>
                    <p className="text-base text-gray-700">Städte und Gemeinden des Kreises</p>
                </h5>
                {/* Другой контент для вкладки "Области" */}
            </div>
        </div>
    );
};

export default RegionDetails;
