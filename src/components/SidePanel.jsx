import { useState } from 'react';
import RegionDetails from './RegionDetails';
import DistrictDetails from './DistrictDetails';
import CityDetails from './CityDetails';

const SidePanel = ({ selectedRegion, districts, cities, onResetSelection, hoveredRegion, onDistrictClick, selectedDistrict, setSelectedDistrictCityInfo, selectedDistrictCityInfo, setSelectedRegionInfo, colorScale, currentCities, clickedCity, selectedCityInDistrict }) => {
    const [activeTab, setActiveTab] = useState('regions');
    const isDistrictsTabActive = selectedRegion;

    const isIndependentCity = selectedDistrictCityInfo &&
        (selectedDistrictCityInfo.properties.name.includes('Kreisfreiestadt') ||
            selectedDistrictCityInfo.properties.name.includes('Landeshauptstadt'));

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const CityItem = ({ city, isSelected, onClick }) => {
        return (
            <div
                className={`p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 scrollable-list-item 
                        ${isSelected ? 'bg-teal-100 font-bold' : ''}`}
                onClick={onClick}
            >
                <p>{city.properties.name}</p>
            </div>
        );
    };

    const getCityKey = (city) => {
        if (!city.properties['land-id'] || !city.properties.id) {
            return Math.random().toString(); // Генерация случайного ключа в крайнем случае
        }
        return `${city.properties['land-id']}${city.properties.id}`;
    };

    const defaultText = "Wählen Sie einen Landkreis auf der Karte aus, um Informationen über den Landkreis und eine Liste der Städte im Landkreis anzuzeigen.";

    return (
        <div className="control-panel">
            <h2 className="text-xl font-bold mb-4 text-center text-[#253494]">Bayern</h2>

            {/* Кнопки "Области" и "Края" */}
            <div className="side-panel-buttons mb-4 flex space-x-2">
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'regions' ? 'bg-blue-500 text-blue-950' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                    onClick={() => handleTabClick('regions')}
                >
                    Bezirke
                </button>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'districts' ? 'bg-blue-500 text-blue-950' : 'bg-gray-300 text-gray-700'
                        } ${!isDistrictsTabActive ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'hover:bg-gray-400'
                        }`}
                    onClick={() => isDistrictsTabActive && handleTabClick('districts')}
                    disabled={!isDistrictsTabActive}
                >
                    Landkreis, kreisfreien Städte
                </button>
            </div>

            {/* Контент боковой панели */}
            <div className="side-panel-content">
                {/* Начальное сообщение - вкладка "Области" */}
                {activeTab === 'regions' && !selectedRegion && (
                    <div className="text-base text-gray-600 mt-4">
                        Klicken Sie auf einen Bezirk, um detaillierte Informationen zu erhalten
                    </div>
                )}

                {/* Информация о наведённой области - вкладка "Области" */}
                {activeTab === 'regions' && hoveredRegion && !selectedRegion && (
                    <div className="mb-4 p-3 bg-gray-100 rounded">
                        <h3 className="text-lg font-semibold">{hoveredRegion.properties.name}</h3>
                        <p className="text-lg">Bevölkerung: {hoveredRegion.properties.population.toLocaleString()} Einw.</p>
                        <p className="text-lg">Fläche: {hoveredRegion.properties.area.toFixed(2)} km²</p>
                    </div>
                )}

                {/* RegionDetails - вкладка "Области" */}
                {activeTab === 'regions' && selectedRegion && (
                    <RegionDetails
                        handleTabClick={handleTabClick}
                        selectedRegion={selectedRegion}
                        districts={districts}
                        cities={cities}
                        onDistrictClick={onDistrictClick}
                        setSelectedDistrictCityInfo={setSelectedDistrictCityInfo}
                        selectedDistrictCityInfo={selectedDistrictCityInfo}
                        setSelectedRegionInfo={setSelectedRegionInfo}
                        currentCities={!selectedDistrict ? currentCities : null}
                        colorScale={colorScale}
                    />
                )}
                {/* Wählen Sie eine Stadt im ausgewählten Gebiet, um Informationen anzuzeigen. */}
                {/* Контент для вкладки "Края" */}
                {activeTab === 'districts' && selectedRegion && (
                    <div className="district-tab-content">
                        <p className="text-sm text-sm/4 text-gray-600 mb-2">
                            {isIndependentCity
                                ? defaultText
                                : selectedDistrict
                                    ? "Wählen Sie eine Stadt im ausgewählten Landkreis, um Informationen zu erhalten."
                                    : defaultText
                            }
                        </p>
                        <DistrictDetails
                            selectedDistrict={selectedDistrict}
                            currentCities={isIndependentCity ? null : currentCities} // currentCities для краев - ? нужно ли?
                        />
                        {!isIndependentCity && (
                            <div className="scrollable-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                <h5 className="font-semibold mt-2">🏞️ Städte / Gemeinde:</h5>
                                <ul className="space-y-2">
                                    {/* Условный рендеринг списка городов */}
                                    {(selectedDistrict
                                        ? currentCities.filter(city => city.properties['land-id'] === selectedDistrict.properties.id) // Фильтр по выбранному краю
                                        : currentCities
                                    ).map(city => (
                                        <li key={getCityKey(city)}>
                                            <div
                                                className={`p-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 scrollable-list-item 
                                            ${selectedDistrictCityInfo?.properties.id === city.properties.id ? 'bg-teal-100 font-bold' : ''}`}>
                                                <CityItem
                                                    city={city}
                                                    isSelected={selectedDistrictCityInfo?.properties.id === city.properties.id}
                                                    onClick={() => {
                                                        setSelectedDistrictCityInfo(city);
                                                        clickedCity(city)
                                                    }
                                                    }
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <CityDetails
                            selectedCityInDistrict={selectedCityInDistrict}
                        />

                    </div>
                )}
            </div>

            {/* Кнопка сброса выбора - вкладки "Области" и "Края" */}
            {(activeTab === 'regions' || activeTab === 'districts') && selectedRegion && (
                <button
                    className="px-4 py-2 bg-blue-500 text-blue-950 rounded hover:bg-blue-600"
                    onClick={() => {
                        onResetSelection();
                        setActiveTab('regions'); // Возвращаем активной вкладку "Области" после сброса
                    }}
                >
                    Map Zurücksetzen
                </button>
            )}
        </div>
    );
};

export default SidePanel;

