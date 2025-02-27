// hooks/useCityData.js
import { useState, useEffect, useCallback } from 'react';

const CITIES_BASE_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/cities';
const REGION_CODES = ['091', '092', '093', '094', '095', '096', '097'];

const useCityData = () => {
    const [allCitiesData, setAllCitiesData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Кэширование загруженных данных по регионам
    const [citiesCache, setCitiesCache] = useState({});

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

    // Загрузка всех городов при инициализации
    useEffect(() => {
        const loadAllCities = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const citiesDataPromises = REGION_CODES.map(code =>
                    loadGeoJson(`${CITIES_BASE_URL}/${code}/cities_region_${code}.geojson`)
                );

                const citiesDataResults = await Promise.all(citiesDataPromises);

                // Обновляем кэш и общий массив данных
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
            } finally {
                setIsLoading(false);
            }
        };

        loadAllCities();
    }, [loadGeoJson]);

    // Получение городов для конкретного района
    const getCitiesForDistrict = useCallback((districtId) => {
        if (!districtId) return [];

        return allCitiesData.filter(city =>
            city.properties['land-id'] === districtId
        );
    }, [allCitiesData]);

    // Получение городов для конкретного региона
    const getCitiesForRegion = useCallback((regionId) => {
        if (!regionId) return [];
        return citiesCache[regionId] || [];
    }, [citiesCache]);

    return {
        allCitiesData,
        isLoading,
        error,
        getCitiesForDistrict,
        getCitiesForRegion
    };
};

export default useCityData;