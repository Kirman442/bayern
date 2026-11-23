import { formatArea, formatPeople } from '../map/format';
import RegionDetails from './RegionDetails';
import DistrictDetails from './DistrictDetails';
import CityDetails from './CityDetails';
import { cityKey } from '../map/selection';

const DEFAULT_DISTRICT_TEXT = "Wählen Sie einen Landkreis auf der Karte aus, um Informationen über den Landkreis und eine Liste der Städte im Landkreis anzuzeigen.";

const CityItem = ({ city, isSelected, onClick }) => (
    <div
        className={`p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 scrollable-list-item 
                ${isSelected ? 'bg-teal-100 font-bold' : ''}`}
        onClick={onClick}
    >
        <p>{city.properties.name}</p>
    </div>
);

const SidePanel = ({ selection, dispatch, region, hoveredRegion, districts, district, cities, city }) => {
    const activeTab = selection.tab;
    const isIndependentCity = district?.properties.kind === 'stadt';
    const setTab = (tab) => dispatch({ type: 'setTab', tab });

    return (
        <div className="control-panel">
            <h2 className="text-xl font-bold mb-4 text-center text-[#253494]">Bayern</h2>

            <div className="side-panel-buttons mb-4 flex space-x-2">
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'regions' ? 'bg-blue-500 text-blue-950' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                    onClick={() => setTab('regions')}
                >
                    Bezirke
                </button>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'districts' ? 'bg-blue-500 text-blue-950' : 'bg-gray-300 text-gray-700'
                        } ${!region ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-gray-400'
                        }`}
                    onClick={() => setTab('districts')}
                    disabled={!region}
                >
                    Landkreise, kreisfreie Städte
                </button>
            </div>

            <div className="side-panel-content">
                {activeTab === 'regions' && !region && (
                    <div className="text-base text-gray-600 mt-4">
                        Klicken Sie auf einen Bezirk, um detaillierte Informationen zu erhalten
                    </div>
                )}

                {activeTab === 'regions' && hoveredRegion && !region && (
                    <div className="mb-4 p-3 bg-gray-100 rounded">
                        <h3 className="text-lg font-semibold">{hoveredRegion.properties.name}</h3>
                        <p className="text-lg">Bevölkerung: {formatPeople(hoveredRegion.properties.population)}</p>
                        <p className="text-lg">Fläche: {formatArea(hoveredRegion.properties.area)}</p>
                    </div>
                )}

                {activeTab === 'regions' && region && (
                    <RegionDetails
                        region={region}
                        districts={districts}
                        selectedDistrictId={selection.districtId}
                        cityCount={district ? null : cities.length}
                        onDistrictClick={(id) => dispatch({ type: 'selectDistrict', id })}
                        onShowDistrictsTab={() => setTab('districts')}
                    />
                )}

                {activeTab === 'districts' && region && (
                    <div className="district-tab-content">
                        <p className="text-sm text-sm/4 text-gray-600 mb-2">
                            {district && !isIndependentCity
                                ? "Wählen Sie eine Stadt im ausgewählten Landkreis, um Informationen zu erhalten."
                                : DEFAULT_DISTRICT_TEXT
                            }
                        </p>
                        <DistrictDetails
                            selectedDistrict={district}
                            cityCount={isIndependentCity ? null : cities.length}
                        />
                        {!isIndependentCity && (
                            <div className="scrollable-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                <h5 className="font-semibold mt-2">🏞️ Städte / Gemeinden:</h5>
                                <ul className="space-y-2">
                                    {cities.map(c => {
                                        const key = cityKey(c);
                                        const isSelected = key === selection.cityKey;
                                        return (
                                            <li key={key}>
                                                <div
                                                    className={`p-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 scrollable-list-item 
                                            ${isSelected ? 'bg-teal-100 font-bold' : ''}`}>
                                                    <CityItem
                                                        city={c}
                                                        isSelected={isSelected}
                                                        onClick={() => dispatch({ type: 'selectCity', key })}
                                                    />
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        <CityDetails city={city} />
                    </div>
                )}
            </div>

            {region && (
                <button
                    className="px-4 py-2 bg-blue-500 text-blue-950 rounded hover:bg-blue-600"
                    onClick={() => dispatch({ type: 'reset' })}
                >
                    Karte zurücksetzen
                </button>
            )}
        </div>
    );
};

export default SidePanel;
