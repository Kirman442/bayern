import { useState, useEffect, useMemo } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import centroid from '@turf/centroid';
import { TextLayer } from '@deck.gl/layers';

const REGIONS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/regions_filtered_min.json';

const useRegions = () => {
    const [regionsData, setRegionsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Загрузка данных о регионах
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(REGIONS_URL);
                const data = await response.json();
                setRegionsData(data);
            } catch (error) {
                console.error('Error loading regions:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);


    const regionsWithCentroids = regionsData && regionsData.features && regionsData.features.length > 0
        ? regionsData.features.map(region => {
            const polygon = {
                type: 'Feature',
                geometry: region.geometry,
                properties: region.properties
            };
            const center = centroid(polygon); // Вычисляем центроид
            return {
                ...region,
                centroid: center.geometry.coordinates // Добавляем центроид в данные
            };
        })
        : []; // Если regionsData равен null или undefined, возвращаем пустой массив


    const createRegionsTextLayer = (regionsWithCentroids) => {
        if (!regionsWithCentroids || regionsWithCentroids.length === 0) {
            return null; // Если данные об областях отсутствуют, возвращаем null
        }

        return new TextLayer({
            id: 'regions-labels',
            data: regionsWithCentroids,
            getPosition: d => d.centroid, // Используем центроид
            getText: d => d.properties.name, // Текст (название области)
            getSize: 16, // Размер текста
            getColor: [255, 255, 255, 100], // Цвет текста (белый)
            getAngle: 0, // Угол поворота текста
            getTextAnchor: 'middle', // Выравнивание текста
            getAlignmentBaseline: 'center', // Базовая линия текста
            parameters: {
                depthTest: false // Отключаем проверку глубины, чтобы текст всегда был виден
            }
        });
    };

    // Создание слоя для регионов
    const createRegionsLayer = (selectedRegion, hoveredRegion, hoveredObject) => {
        if (!regionsData) return null;

        return new GeoJsonLayer({
            id: 'regions',
            data: regionsData,
            pickable: true,
            stroked: false,
            filled: true,
            extruded: true,
            lineWidthScale: 1,
            wireframe: true,
            lineWidthMinPixels: 1,
            // getFillColor: d => { // <---- ЗАМЕНИТЕ ВАШ ТЕКУЩИЙ getFillColor НА ЭТОТ КОД ПОЛНОСТЬЮ!
            //     const isSelectedRegion = selectedRegion && d.properties.id === selectedRegion.properties.id;
            //     const isHovered = hoveredObject && d.properties.id === hoveredObject.properties.id && hoveredObject.layer.id === 'regions';

            //     console.log("getFillColor - isSelectedRegion:", isSelectedRegion, "isHovered:", isHovered, "hoveredObject:", hoveredObject); // <----  ДОБАВЬТЕ ЭТОТ ЛОГ В НАЧАЛО getFillColor!


            //     if (isSelectedRegion) {
            //         return [200, 80, 200, 255]; // Фиолетовый цвет для ВЫБРАННОГО региона
            //     } else if (isHovered) {
            //         return [8, 170, 255, 180]; // Светло-синий цвет для наведения
            //     } else {
            //         return [65, 182, 230, 180]; //  Базовый синий цвет для регионов
            //     }
            // },
            getFillColor: d => {
                const isSelected = selectedRegion && d.properties.id === selectedRegion.properties.id;
                const isHovered = hoveredRegion && d.properties.id === hoveredRegion.properties.id;
                const isSelectedRegion = selectedRegion && d.properties.id === selectedRegion.properties.id; // <----  НОВОЕ УСЛОВИЕ ДЛЯ ВЫБРАННОГО РЕГИОНА

                if (isSelected) return [100, 150, 255, 200];
                if (isHovered) return [23, 86, 118, 250];
                if (selectedRegion) return [100, 100, 100, 100];
                if (isSelectedRegion) return [200, 80, 200, 255]; // <----  НОВЫЙ ЦВЕТ - Фиолетовый для ВЫБРАННОГО региона
                return [65, 182, 230, 180];
            },
            // getLineColor: [60, 60, 60, 200],
            getLineColor: d => {
                const isSelected = selectedRegion && d.properties.id === selectedRegion.properties.id;
                const isHovered = hoveredRegion && d.properties.id === hoveredRegion.properties.id;
                if (isSelected) return [60, 60, 60, 80];
                if (isHovered) return [60, 60, 60, 20];
                if (selectedRegion) return [60, 60, 60, 100];
                return [255, 255, 230, 20];
            },

            getElevation: d => (d.properties.population / d.properties.area) * 5,
            updateTriggers: {
                getFillColor: [selectedRegion, hoveredRegion, hoveredObject]
            }
        });
    };

    return { regionsData, regionsWithCentroids, isLoading, createRegionsLayer, createRegionsTextLayer };
};

export default useRegions;