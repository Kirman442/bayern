import { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from '@vis.gl/react-maplibre';
import useBoundary from './BoundaryHandler';
import useRegions from './RegionsHandler';
import useDistricts from './DistrictsHandler';
import SidePanel from './SidePanel';
import useCombinedCityData from './CityPointsHandler';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const mapStyle = `${MAP_STYLE}`;

const INITIAL_VIEW_STATE = {
    longitude: 11.4,
    latitude: 48.5,
    zoom: 7,
    maxZoom: 10,
    minZoom: 6,
    pitch: 33,
    bearing: 0
};

const BavariaMapThree = () => {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const [hoveredDistrict, setHoveredDistrict] = useState(null);
    const [hoveredObject, setHoveredObject] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedDistrictCity, setSelectedDistrictCity] = useState(null);
    const [selectedRegionCity, setSelectedRegionCity] = useState(null);

    const [, setSelectedRegionInfo] = useState(null);
    const [selectedDistrictCityInfo, setSelectedDistrictCityInfo] = useState(null); // New state for district/city info in SidePanel

    const { createGlowLayer } = useBoundary();
    const { regionsWithCentroids, isLoading, createRegionsLayer, createRegionsTextLayer } = useRegions();
    const { districts, cities, fetchDistrictsAndCitiesData, createDistrictsLayer, resetDistrictsData, DISTRICTS_COLOR_SCALE } = useDistricts();

    const { createCityPointsLayer, getCitiesForDistrict, getCitiesForRegion, resetCityPoints } = useCombinedCityData();
    const [currentCities, setCurrentCities] = useState(null);

    const [clickedCity, setClickedCity] = useState(null);

    useEffect(() => {
        if (selectedDistrictCity) {
            const cities = getCitiesForDistrict(selectedDistrictCity.properties.id);
            setCurrentCities(cities);
        }
    }, [selectedDistrictCity, getCitiesForDistrict]);

    useEffect(() => {
        if (selectedRegionCity) {
            const cities = getCitiesForRegion(selectedRegionCity.properties.id);
            setCurrentCities(cities);
        }
    }, [selectedRegionCity, getCitiesForRegion]);

    useEffect(() => {
    }, [clickedCity]);

    const handleRegionClick = (object) => {
        setSelectedRegion(object);
        setSelectedRegionInfo(object); // Update selectedRegionInfo state with clicked region object
        setSelectedRegionCity(object);
        setSelectedDistrict(null); // Сбрасываем выбранный район
        setSelectedDistrictCityInfo(null); // Reset district/city info when new region is selected (optional, adjust as needed)
        fetchDistrictsAndCitiesData(object.properties.id);
        resetCityPoints();
    };

    const handleResetSelection = () => {
        setSelectedRegion(null);
        setSelectedDistrict(null);
        setSelectedRegionInfo(null);
        setSelectedDistrictCity(null);
        setSelectedDistrictCityInfo(null);
        setSelectedRegionCity(null);
        resetDistrictsData(); //null
        resetCityPoints(); // сбрасываем точки городов
    };

    const handleDistrictClick = (object) => {
        setSelectedDistrict(object);
        setSelectedDistrictCity(object);
        setSelectedDistrictCityInfo(object); // Update selectedDistrictCityInfo state with clicked district/city object
        setClickedCity(object)
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Загрузка данных...</div>
            </div>
        );
    };

    const cityLayer = selectedRegionCity && currentCities // Меняем на selectedDistrictCity если хотим получить только города в районе
        ? createCityPointsLayer(null, null, clickedCity)
        : null;

    const renderLayers = () => {
        const layers = [
            createGlowLayer(10, 0.1, 'outer'),
            createGlowLayer(5, 0.2, 'middle'),
            createGlowLayer(2, 0.3, 'inner'),
            createRegionsLayer(selectedRegion, hoveredRegion, hoveredObject),
            createDistrictsLayer(hoveredDistrict, selectedDistrictCity), // Меняем на selectedRegionCity если хотим получить только города в области
            createRegionsTextLayer(regionsWithCentroids),
            cityLayer
        ].filter(Boolean);
        return layers;
    };

    function getTooltip({ object }) {
        if (!object) return null;

        if (object.properties && object.properties["land-id"]) {
            return {
                html: `
                    <div><b>Stadt / Gemeinde</b></div>
                    <div><b>Name:</b> ${object.properties.name}</div>
                    <div><b>Bevölkerung:</b> ${object.properties.population.toLocaleString()}</div>
                    <div><b>Fläche:</b> ${object.properties.area} km²</div>
                    `
            };
        }
        return null;
    }

    return (
        <div style={{ width: '800px', height: '600px' }} >
            <DeckGL
                layers={renderLayers()}
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                getTooltip={getTooltip}
                onClick={({ object, layer }) => {
                    if (object) {

                        if (layer.id === 'regions') {
                            handleRegionClick(object);
                        } else if (layer.id === 'districts') {
                            handleDistrictClick(object);
                        } else if (layer.id === 'city-points') {
                            setClickedCity(object);
                            setSelectedDistrictCityInfo(object);
                        } else {
                            handleRegionClick(object);
                        }
                    } else {
                        handleResetSelection();
                    }
                }}
                onHover={({ object }) => {
                    if (object) {
                        if (selectedRegion) {
                            setHoveredDistrict(object);
                        } else {
                            setHoveredRegion(object);
                        }
                    } else {
                        setHoveredRegion(null);
                        setHoveredDistrict(null);
                    }
                }}
            >
                <Map mapStyle={mapStyle} />
            </DeckGL>
            {/* Боковая панель */}
            <SidePanel
                selectedRegion={selectedRegion}
                districts={districts}
                cities={cities}
                onResetSelection={handleResetSelection}
                setSelectedDistrictCityInfo={setSelectedDistrictCityInfo}
                selectedDistrictCityInfo={selectedDistrictCityInfo}
                setSelectedRegionInfo={setSelectedRegionInfo}
                onDistrictClick={handleDistrictClick}
                selectedDistrict={selectedDistrict}
                hoveredRegion={hoveredRegion}
                hoveredObject={hoveredObject}
                setHoveredObject={setHoveredObject}
                colorScale={DISTRICTS_COLOR_SCALE}
                clickedCity={setClickedCity}
                currentCities={currentCities}
                selectedCityInDistrict={clickedCity}
            />
        </div>
    );
};

export default BavariaMapThree;