import { useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { scaleThreshold, scaleLinear } from 'd3-scale';

const DISTRICTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/landkreisestaedte_min.json';
const INDEPENDENT_CITIES_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/kreisfreiestaedte_min.json';

const useDistricts = () => {
    const [districts, setDistricts] = useState([]); // Края
    const [cities, setCities] = useState([]); // Независимые города

    // Загрузка данных о краях и независимых городах
    const fetchDistrictsAndCitiesData = async (regionId) => {
        try {
            // Загружаем данные о краях
            const districtsResponse = await fetch(DISTRICTS_URL);
            const districtsData = await districtsResponse.json();
            const filteredDistricts = districtsData.features.filter(
                district => district.properties.id.slice(0, 3) === regionId.slice(0, 3)
            ).map(district => {
                return {
                    ...district,
                    properties: {
                        ...district.properties,
                        name: `Landkreis ${district.properties.name}`
                    }
                };
            });

            // Загружаем данные о независимых городах
            const citiesResponse = await fetch(INDEPENDENT_CITIES_URL);
            const citiesData = await citiesResponse.json();
            const filteredCities = citiesData.features.filter(
                city => city.properties.id.slice(0, 3) === regionId.slice(0, 3)
            ).map(city => {
                let cityNamePrefix = "Kreisfreiestadt"; // По умолчанию - Kreisfreiestadt

                if (city.properties.id === "09162") { // Проверка на ID Мюнхена
                    cityNamePrefix = "Landeshauptstadt"; // Если ID Мюнхена, то Landeshauptstadt
                }

                return {
                    ...city,
                    properties: {
                        ...city.properties,
                        name: `${cityNamePrefix} ${city.properties.name}` // Используем выбранный префикс
                    }
                };
            });
            // Сохраняем данные раздельно
            setDistricts(filteredDistricts);
            setCities(filteredCities);
        } catch (error) {
            // console.error('Error loading districts or cities:', error);
        }
    };

    // Сброс данных
    const resetDistrictsData = () => {
        setDistricts([]);
        setCities([]);
    };

    const DISTRICTS_COLOR_SCALE = scaleThreshold()
        .domain([500, 1000, 1500, 2000, 2500])
        .range([
            [37, 52, 148, 200],
            [44, 127, 184, 200],
            [65, 182, 196, 200],
            [127, 205, 187, 200],
            [199, 233, 180, 200]
        ]);

    const CITIES_COLOR_SCALE = scaleThreshold()
        .domain([100, 200, 300, 400, 500])
        .range([
            [27, 120, 55, 255],
            [56, 166, 91, 255],
            [109, 192, 124, 255],
            [177, 221, 161, 255],
            [230, 245, 208, 255]
        ]);

    // Создание слоя для краёв и независимых городов
    const createDistrictsLayer = (hoveredDistrict, selectedDistrictCity) => {
        const combinedData = [...districts, ...cities];
        if (combinedData.length === 0) return null;

        return new GeoJsonLayer({
            id: 'districts',
            data: combinedData,
            pickable: true,
            stroked: true,
            filled: true,
            extruded: true,
            wireframe: true,
            getElevation: d => {
                const isSelectedDistrictCity = selectedDistrictCity && d.properties.id === selectedDistrictCity.properties.id;
                const isIndependentCity = d.properties.name.includes('Kreisfreiestadt') || d.properties.name.includes('Landeshauptstadt');

                if (isSelectedDistrictCity && isIndependentCity) {
                    return 30000; // Увеличиваем высоту для выбранного независимого города
                }

                if (isSelectedDistrictCity && !isIndependentCity) {
                    return (d.properties.population / d.properties.area) * 65; // Увеличиваем высоту для края
                }

                return isIndependentCity
                    ? (d.properties.population / d.properties.area) * 3 // Высота для независимых городов
                    : (d.properties.population / d.properties.area) * 20; // Высота для краёв
            },
            // getElevation: d =>
            //     d.properties.name.includes('Kreisfreiestadt') || d.properties.name.includes('Landeshauptstadt')
            //         ? (d.properties.population / d.properties.area) * 3
            //         : (d.properties.population / d.properties.area) * 20,
            getFillColor: d => {
                const isHovered = hoveredDistrict && d.properties.id === hoveredDistrict.properties.id;
                const isSelectedDistrictCity = selectedDistrictCity && d.properties.id === selectedDistrictCity.properties.id;
                if (isHovered) return [23, 86, 118, 250];
                if (isSelectedDistrictCity) {
                    return [23, 86, 118, 250];
                }
                return d.properties.name.includes('Kreisfreiestadt') || d.properties.name.includes('Landeshauptstadt')
                    ? CITIES_COLOR_SCALE(d.properties.population)
                    : DISTRICTS_COLOR_SCALE(d.properties.area)
            },
            getLineColor: [255, 255, 255, 50],
            lineWidthMinPixels: 1,
            transitions: {
                getElevation: 500,
            },
            updateTriggers: {
                getFillColor: [hoveredDistrict, selectedDistrictCity],
                getLineColor: [hoveredDistrict],
                getElevation: [selectedDistrictCity]
            }
        });
    };

    return { districts, cities, fetchDistrictsAndCitiesData, createDistrictsLayer, resetDistrictsData, DISTRICTS_COLOR_SCALE };
};

export default useDistricts;