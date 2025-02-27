import { useState, useEffect, useCallback } from 'react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { scaleLinear } from 'd3-scale';

const CITIES_BASE_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/cities';
const REGION_CODES = ['091', '092', '093', '094', '095', '096', '097'];

const POINT_SIZE_SCALE = scaleLinear()
    .domain([0, 30000])
    .range([500, 3000]);

const POINT_COLOR_SCALE = scaleLinear()
    .domain([0, 50000])
    .range([[255, 255, 255], [189, 0, 38]]);

const useCombinedCityData = () => {
    const [allCitiesData, setAllCitiesData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [citiesCache, setCitiesCache] = useState({});
    const [activeCities, setActiveCities] = useState(null);

    const loadGeoJson = useCallback(async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error loading GeoJSON from ${url}:`, error);
            throw error;
        }
    }, []);

    useEffect(() => {
        const loadAllCities = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const citiesDataPromises = REGION_CODES.map(code =>
                    loadGeoJson(`${CITIES_BASE_URL}/${code}/cities_region_${code}.geojson`)
                );

                const citiesDataResults = await Promise.all(citiesDataPromises);

                const newCache = {};
                const allFeatures = [];

                citiesDataResults.forEach((data, index) => {
                    if (data && data.features) {
                        const regionCode = REGION_CODES[index];
                        newCache[regionCode] = data.features;
                        allFeatures.push(...data.features);
                    }
                });

                setCitiesCache(newCache);
                setAllCitiesData(allFeatures);
            } catch (error) {
                setError(error);
                console.error('Error loading city data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadAllCities();
    }, [loadGeoJson]);

    const getCitiesForDistrict = useCallback((districtId) => {
        if (!districtId) return [];
        const filteredCities = allCitiesData.filter(city =>
            city.properties['land-id'] === districtId
        );
        setActiveCities(filteredCities);
        return filteredCities;
    }, [allCitiesData]);

    const getCitiesForRegion = useCallback((regionId) => {
        if (!regionId) return [];
        const regionCities = citiesCache[regionId] || [];
        setActiveCities(regionCities);
        return regionCities;
    }, [citiesCache]);

    const resetCityPoints = useCallback(() => {
        setActiveCities(null);
    }, []);

    const createCityPointsLayer = useCallback((districtId = null, regionId = null, clickedCity) => {
        let cityData = [];

        if (districtId) {
            cityData = getCitiesForDistrict(districtId);
        } else if (regionId) {
            cityData = getCitiesForRegion(regionId);
        } else if (activeCities) {
            cityData = activeCities;
        }

        // Фильтруем некорректные данные
        cityData = cityData.filter(city => city && city.properties && city.properties.population !== undefined);

        if (cityData.length === 0) return null;

        return new ScatterplotLayer({
            id: 'city-points',
            data: cityData,
            pickable: true,
            opacity: 0.8,
            stroked: true,
            filled: true,
            radiusScale: .8,
            radiusMinPixels: 3,
            radiusMaxPixels: 25,
            lineWidthMinPixels: 1,
            getPosition: d => d.geometry.coordinates,
            // getRadius: d => POINT_SIZE_SCALE(d.properties.population * 1.5),
            getRadius: d => {
                const cityUniqueId = `${d.properties['land-id']}-${d.properties.id}`;
                const selectedCityUniqueId = clickedCity && clickedCity.properties ?
                    `${clickedCity.properties['land-id']}-${clickedCity.properties.id}` :
                    null;

                const isSelectedCityInDistrict = cityUniqueId === selectedCityUniqueId;

                return isSelectedCityInDistrict ? POINT_SIZE_SCALE(d.properties.population * 10) : POINT_SIZE_SCALE(d.properties.population * 1.5);
            },
            // getFillColor: d => POINT_COLOR_SCALE(d.properties.population * 1.5),
            getFillColor: d => {
                if (!d || !d.properties || !d.properties.population) {
                    return [0, 0, 0, 0]; // Возвращаем прозрачный цвет
                }
                const cityUniqueId = `${d.properties['land-id']}-${d.properties.id}`;

                // Создаём уникальный идентификатор для выбранного города
                const selectedCityUniqueId = clickedCity && clickedCity.properties ?
                    `${clickedCity.properties['land-id']}-${clickedCity.properties.id}` :
                    null;

                // Проверяем, выбран ли город
                const isSelectedCityInDistrict = cityUniqueId === selectedCityUniqueId;
                if (isSelectedCityInDistrict) {
                    return [100, 150, 255, 200]; // Цвет для выбранного города
                }

                return POINT_COLOR_SCALE(d.properties.population * 1.5); // Цвет для невыбранных городов
            },
            getLineColor: [255, 255, 255],
            parameters: {
                depthTest: false
            },
            updateTriggers: {
                getFillColor: [clickedCity],
                getRadius: [clickedCity]
            }
        });
    }, [getCitiesForDistrict, getCitiesForRegion, activeCities]);

    return {
        allCitiesData,
        // isLoading,
        error,
        getCitiesForDistrict,
        getCitiesForRegion,
        createCityPointsLayer,
        resetCityPoints
    };
};

export default useCombinedCityData;


// getFillColor: d => {
//     // console.log("City data:", d); // Логируем данные города
//     if (!d || !d.properties || !d.properties.population) {
//         // console.warn("Invalid city data:", d); // Логируем некорректные данные
//         return [0, 0, 0, 0]; // Возвращаем прозрачный цвет
//     }

//     // Создаём уникальный идентификатор для города
//     const cityUniqueId = `${d.properties['land-id']}-${d.properties.id}`;
//     // console.log("City data:", d);
//     // console.log("City unique ID:", cityUniqueId);

//     // Создаём уникальный идентификатор для выбранного города
//     const selectedCityUniqueId = clickedCity && clickedCity.properties ?
//         `${clickedCity.properties['land-id']}-${clickedCity.properties.id}` :
//         null;
//     // console.log("electedCityUniqueId unique ID:", selectedCityUniqueId);

//     // Проверяем, выбран ли город
//     const isSelectedCityInDistrict = cityUniqueId === selectedCityUniqueId;
//     // console.log("Смотрим на константу isSelectedCityInDistrict:", isSelectedCityInDistrict); // Логируем некорректные данные

//     // const isSelectedCityInDisdtrict = selectedCityInDistrict &&
//     //     d.properties &&
//     //     selectedCityInDistrict.properties &&
//     //     d.properties.population === selectedCityInDistrict.properties.population;

//     if (isSelectedCityInDistrict) {
//         return [100, 150, 255, 200]; // Цвет для выбранного города
//     }

//     return POINT_COLOR_SCALE(d.properties.population * 1.5); // Цвет для невыбранных городов
// },