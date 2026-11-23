import ColorLegend from './ColorLegend';
import CityCirclesLegend from './CityCirclesLegend';

const RegionDetails = ({ region, districts, selectedDistrictId, cityCount, colorScale, onDistrictClick, onShowDistrictsTab }) => {
    const landkreise = districts.filter(d => d.properties.kind === 'landkreis');
    const staedte = districts.filter(d => d.properties.kind === 'stadt');

    return (
        <div className="mb-4">
            {/* Информация о выбранной области */}
            <div className="p-3 bg-blue-100 rounded">
                <h3 className="text-lg font-semibold">{region.properties.name}</h3>
                <p className="text-base">Bevölkerung: {region.properties.population.toLocaleString()} Einw.</p>
                <p className="text-base">Fläche: {region.properties.area.toFixed(2)} km²</p>
                <p className="text-base">Bevölkerungsdichte: {(region.properties.population / region.properties.area).toFixed(1)} Einw/km²</p>
                <h4 className="text-base font-semibold">Als Teil des Bezirks:</h4>
                <p className="text-base">Kreisfreiestädte: {staedte.length}</p>
                <p className="text-base">Landkreise: {landkreise.length}</p>
                {cityCount !== null && (
                    <p className="text-base">Städte / Gemeinde: {cityCount}</p>
                )}

                <ColorLegend colorScale={colorScale} />
                <CityCirclesLegend />
            </div>

            {/* Список краёв и независимых городов */}
            <div className="mt-2">
                <div className="scrollable-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <h5 className="font-semibold mt-2">🏞️ Landkreise:</h5>
                    <ul className="space-y-2">
                        {landkreise.map(district => (
                            <li key={district.properties.id}>
                                <div
                                    className={`p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 scrollable-list-item 
                                        ${selectedDistrictId === district.properties.id ? 'bg-teal-100 font-bold' : ''}`}
                                    onClick={() => onDistrictClick(district.properties.id)}
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
                        {staedte.map(city => (
                            <li key={city.properties.id}>
                                <div
                                    className={`p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 scrollable-list-item 
                                        ${selectedDistrictId === city.properties.id ? 'bg-teal-100 font-bold' : ''}`}
                                    onClick={() => onDistrictClick(city.properties.id)}
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
                        onClick={onShowDistrictsTab}
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
