import { formatArea, formatPeople } from '../map/format';
import RegionDetails from './RegionDetails';
import DistrictDetails from './DistrictDetails';
import CityDetails from './CityDetails';
import { cityKey } from '../map/selection';

const DEFAULT_DISTRICT_TEXT = "Wählen Sie einen Landkreis auf der Karte aus, um Informationen über den Landkreis und eine Liste der Städte im Landkreis anzuzeigen.";

const tabClass = (active) => `px-3 py-1.5 rounded-lg text-sm font-medium ${active
    ? 'bg-[#253494] text-white'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

// Bayern › Bezirk › Landkreis › Gemeinde; every level above the current one is a link.
const Breadcrumbs = ({ items }) => (
    <nav aria-label="Auswahl" className="text-sm text-gray-600 mb-3 flex flex-wrap items-center gap-x-1">
        {items.map((item, i) => (
            <span key={item.label} className="flex items-center gap-x-1">
                {i > 0 && <span aria-hidden="true">›</span>}
                {item.onClick
                    ? <button className="text-[#253494] hover:underline" onClick={item.onClick}>{item.label}</button>
                    : <span className="font-semibold text-gray-800">{item.label}</span>}
            </span>
        ))}
    </nav>
);

const SidePanel = ({ selection, dispatch, region, hoveredRegion, districts, district, cities, city }) => {
    const activeTab = selection.tab;
    const isIndependentCity = district?.properties.kind === 'stadt';
    const setTab = (tab) => dispatch({ type: 'setTab', tab });

    const crumbs = [{ label: 'Bayern' }];
    if (region) crumbs.push({ label: region.properties.name });
    if (district) crumbs.push({ label: district.properties.name });
    if (city) crumbs.push({ label: city.properties.name });
    // Link every level but the last one back to itself.
    const targets = [
        { type: 'reset' },
        region && { type: 'selectRegion', id: region.properties.id },
        district && { type: 'selectDistrict', id: district.properties.id },
    ];
    crumbs.slice(0, -1).forEach((c, i) => { c.onClick = () => dispatch(targets[i]); });

    return (
        <div className="control-panel">
            <h2 className="text-xl font-bold mb-2 text-[#253494]">Bayern</h2>
            {region && <Breadcrumbs items={crumbs} />}

            <div className="side-panel-buttons mb-4 flex gap-2">
                <button
                    className={tabClass(activeTab === 'regions')}
                    onClick={() => setTab('regions')}
                >
                    Bezirke
                </button>
                <button
                    className={`${tabClass(activeTab === 'districts')} ${!region ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        <p className="text-sm/4 text-gray-600 mb-2">
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
                                <ul className="space-y-1">
                                    {cities.map(c => {
                                        const key = cityKey(c);
                                        const isSelected = key === selection.cityKey;
                                        return (
                                            <li key={key}>
                                                <button
                                                    className={`w-full text-left px-2 py-1 rounded ${isSelected ? 'bg-teal-100 font-bold' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                    onClick={() => dispatch({ type: 'selectCity', key })}
                                                >
                                                    {c.properties.name}
                                                </button>
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
                    className="mt-4 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                    onClick={() => dispatch({ type: 'reset' })}
                >
                    Karte zurücksetzen
                </button>
            )}

            <p className="mt-4 text-xs text-gray-500">
                Bevölkerung Stand: 31.12.2025 (Basis Zensus 2022) · Quelle: Bayerisches Landesamt für Statistik / Destatis
            </p>
        </div>
    );
};

export default SidePanel;
