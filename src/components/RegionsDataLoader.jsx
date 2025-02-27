// RegionsDataLoader.js
import React, { useEffect, useState } from 'react';

const REGIONS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/regions_filtered.geojson';

const RegionsDataLoader = ({ setRegionsData, setIsLoading }) => {
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Устанавливаем isLoading в true перед началом загрузки
            try {
                const response = await fetch(REGIONS_URL);
                const data = await response.json();
                setRegionsData(data);
                console.log('Regions data loaded in RegionsDataLoader:', data);
            } catch (error) {
                console.error('Error loading regions in RegionsDataLoader:', error);
            } finally {
                setIsLoading(false); // Устанавливаем isLoading в false после загрузки или ошибки
            }
        };
        fetchData();
    }, [setRegionsData, setIsLoading]);

    return null; // Этот компонент ничего не рендерит, только загружает данные
};

export default RegionsDataLoader;