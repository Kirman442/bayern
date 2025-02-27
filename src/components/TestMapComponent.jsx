// import React from 'react';
// import { Map } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { ScatterplotLayer } from '@deck.gl/layers';

// // Цвета для точек
// const MALE_COLOR = [0, 128, 255]; // Синий для мужчин
// const FEMALE_COLOR = [255, 0, 128]; // Розовый для женщин

// // Исходные данные GeoJSON (замените на ваш файл или URL)
// const GEOJSON_DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/manhattan.json';

// // Начальное состояние карты
// const INITIAL_VIEW_STATE = {
//     longitude: -74,
//     latitude: 40.7,
//     zoom: 11,
//     maxZoom: 16,
//     pitch: 0,
//     bearing: 0
// };
// const TestMapComponent = ({
//     data = GEOJSON_DATA_URL,
//     radius = 30,
//     maleColor = MALE_COLOR,
//     femaleColor = FEMALE_COLOR,
//     mapStyle = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'
// }) => {
//     // Обработка данных GeoJSON
//     const layers = [
//         new ScatterplotLayer({
//             id: 'city-points',
//             data,
//             radiusScale: radius,
//             radiusMinPixels: 0.25,
//             getPosition: d => [d[0], d[1], 0], // Получаем координаты из GeoJSON
//             getFillColor: d => (d[2] === 1 ? maleColor : femaleColor), // Цвет точек
//             updateTriggers: {
//                 getFillColor: [maleColor, femaleColor]
//             }
//         })
//     ];
//     console.log("Layers array (Points):", layers);

//     return (
//         <DeckGL layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
//             <Map reuseMaps mapStyle={mapStyle} />
//         </DeckGL>
//     );
// };

// export default TestMapComponent;

// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import { Map } from 'react-map-gl/maplibre';
// import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
// import { HexagonLayer } from '@deck.gl/aggregation-layers';
// import DeckGL from '@deck.gl/react';

// // Источник данных CSV
// const DATA_URL =
//     'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';

// // Настройки освещения
// const ambientLight = new AmbientLight({
//     color: [255, 255, 255],
//     intensity: 1.0
// });

// const pointLight1 = new PointLight({
//     color: [255, 255, 255],
//     intensity: 0.8,
//     position: [-0.144528, 49.739968, 80000]
// });

// const pointLight2 = new PointLight({
//     color: [255, 255, 255],
//     intensity: 0.8,
//     position: [-3.807751, 54.104682, 8000]
// });

// const lightingEffect = new LightingEffect({ ambientLight, pointLight1, pointLight2 });

// // Начальное состояние карты
// const INITIAL_VIEW_STATE = {
//     longitude: -1.415727,
//     latitude: 52.232395,
//     zoom: 6.6,
//     minZoom: 5,
//     maxZoom: 15,
//     pitch: 40.5,
//     bearing: -27
// };

// // Стиль карты
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

// // Цветовая шкала для тепловой карты
// const colorRange = [
//     [1, 152, 189],
//     [73, 227, 206],
//     [216, 254, 181],
//     [254, 237, 177],
//     [254, 173, 84],
//     [209, 55, 78]
// ];

// // Функция для отображения подсказки
// function getTooltip({ object }) {
//     if (!object) {
//         return null;
//     }
//     const lat = object.position[1];
//     const lng = object.position[0];
//     const count = object.count;

//     return `\
//     latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
//     longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
//     ${count} Accidents`;
// }

// const TestMapComponent = ({
//     data = null,
//     mapStyle = MAP_STYLE,
//     radius = 1000,
//     upperPercentile = 100,
//     coverage = 1
// }) => {
//     const layers = [
//         new HexagonLayer({
//             id: 'heatmap',
//             gpuAggregation: true,
//             colorRange,
//             coverage,
//             data,
//             elevationRange: [0, 3000],
//             elevationScale: data && data.length ? 50 : 0,
//             extruded: true,
//             getPosition: d => d,
//             pickable: true,
//             radius,
//             upperPercentile,
//             material: {
//                 ambient: 0.64,
//                 diffuse: 0.6,
//                 shininess: 32,
//                 specularColor: [51, 51, 51]
//             },
//             transitions: {
//                 elevationScale: 3000
//             }
//         })
//     ];

//     return (
//         <DeckGL
//             layers={layers}
//             effects={[lightingEffect]}
//             initialViewState={INITIAL_VIEW_STATE}
//             controller={true}
//             getTooltip={getTooltip}
//         >
//             <Map reuseMaps mapStyle={mapStyle} />
//         </DeckGL>
//     );
// };

// export default TestMapComponent;


// import React, { useState, useEffect } from 'react';
// import { Map } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
// import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
// import { scaleThreshold } from 'd3-scale';

// // Источник данных GeoJSON
// const DATA_URL =
//     'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/geojson/vancouver-blocks.json';

// // Цветовая шкала
// const COLOR_SCALE = scaleThreshold()
//     .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
//     .range([
//         [65, 182, 196],
//         [127, 205, 187],
//         [199, 233, 180],
//         [237, 248, 177],
//         // zero
//         [255, 255, 204],
//         [255, 237, 160],
//         [254, 217, 118],
//         [254, 178, 76],
//         [253, 141, 60],
//         [252, 78, 42],
//         [227, 26, 28],
//         [189, 0, 38],
//         [128, 0, 38]
//     ]);

// // Начальное состояние карты
// const INITIAL_VIEW_STATE = {
//     latitude: 49.254,
//     longitude: -123.13,
//     zoom: 11,
//     maxZoom: 16,
//     pitch: 45,
//     bearing: 0
// };

// // Стиль карты
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

// // Освещение
// const ambientLight = new AmbientLight({
//     color: [255, 255, 255],
//     intensity: 1.0
// });

// const dirLight = new SunLight({
//     timestamp: Date.UTC(2019, 7, 1, 22),
//     color: [255, 255, 255],
//     intensity: 1.0,
//     _shadow: true
// });

// // Полигон для земли (тени)
// const landCover = [
//     [
//         [-123.0, 49.196],
//         [-123.0, 49.324],
//         [-123.306, 49.324],
//         [-123.306, 49.196]
//     ]
// ];

// // Функция для отображения подсказки
// function getTooltip({ object }) {
//     if (object) {
//         console.log('Подсказка:', {
//             valuePerParcel: object.properties.valuePerParcel,
//             valuePerSqm: object.properties.valuePerSqm,
//             growth: object.properties.growth
//         });
//         return {
//             html: `\
//   <div><b>Average Property Value</b></div>
//   <div>${object.properties.valuePerParcel} / parcel</div>
//   <div>${object.properties.valuePerSqm} / m<sup>2</sup></div>
//   <div><b>Growth</b></div>
//   <div>${Math.round(object.properties.growth * 100)}%</div>
//   `
//         };
//     }
//     return null;
// }


// const MapComponent = ({
//     data = DATA_URL,
//     mapStyle = MAP_STYLE
// }) => {
//     const [effects] = useState(() => {
//         const lightingEffect = new LightingEffect({ ambientLight, dirLight });
//         lightingEffect.shadowColor = [0, 0, 0, 0.5];
//         console.log('Освещение и тени настроены');
//         return [lightingEffect];
//     });

//     const [geoJsonData, setGeoJsonData] = useState(null);

//     // Загрузка данных
//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 const response = await fetch(data);
//                 const json = await response.json();
//                 console.log('Данные GeoJSON загружены:', json);
//                 setGeoJsonData(json);
//             } catch (error) {
//                 console.error('Ошибка загрузки данных GeoJSON:', error);
//             }
//         };

//         loadData();
//     }, [data]);

//     const layers = [
//         // Слой для земли (тени)
//         new PolygonLayer({
//             id: 'ground',
//             data: landCover,
//             stroked: false,
//             getPolygon: f => f,
//             getFillColor: [0, 0, 0, 0],
//             onDataLoad: () => console.log('Слой земли (тени) загружен')
//         }),
//         // Слой GeoJSON
//         new GeoJsonLayer({
//             id: 'geojson',
//             data: geoJsonData,
//             opacity: 0.8,
//             stroked: false,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
//             getFillColor: f => COLOR_SCALE(f.properties.growth),
//             getLineColor: [255, 255, 255],
//             pickable: true,
//             onDataLoad: () => console.log('Слой GeoJSON загружен'),
//             onAfterRender: () => console.log('Слой GeoJSON отрисован')
//         })
//     ];

//     return (
//         <DeckGL
//             layers={layers}
//             effects={effects}
//             initialViewState={INITIAL_VIEW_STATE}
//             controller={true}
//             getTooltip={getTooltip}
//             onLoad={() => console.log('DeckGL загружен')}
//             onAfterRender={() => console.log('DeckGL отрисован')}
//         >
//             <Map reuseMaps mapStyle={mapStyle} onLoad={() => console.log('Карта загружена')} />
//         </DeckGL>
//     );
// };

// export default MapComponent;


// import React, { useState, useEffect } from 'react';
// import { Map } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
// import { LightingEffect, AmbientLight, _SunLight as SunLight } from '@deck.gl/core';
// import { scaleThreshold } from 'd3-scale';

// // Источник данных GeoJSON (замените на ваш файл или URL)
// const DATA_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/refs/heads/main/landkreisestaedte_min.json';

// // Цветовая шкала для площади (area)
// const COLOR_SCALE = scaleThreshold()
//     .domain([500, 1000, 1500, 2000, 2500]) // Пороговые значения для площади
//     .range([
//         [65, 182, 196], // Голубой
//         [127, 205, 187], // Зеленый
//         [199, 233, 180], // Светло-зеленый
//         [237, 248, 177], // Желто-зеленый
//         [255, 255, 204]  // Желтый
//     ]);

// // Начальное состояние карты (центр на Германии)
// const INITIAL_VIEW_STATE = {
//     latitude: 48.5,
//     longitude: 12.5,
//     zoom: 6,
//     maxZoom: 16,
//     pitch: 45,
//     bearing: 0
// };

// // Стиль карты
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

// // Освещение
// const ambientLight = new AmbientLight({
//     color: [255, 255, 255],
//     intensity: 1.0
// });

// const dirLight = new SunLight({
//     timestamp: Date.UTC(2023, 7, 1, 12), // Полдень
//     color: [255, 255, 255],
//     intensity: 1.0,
//     _shadow: true
// });

// // Функция для отображения подсказки
// function getTooltip({ object }) {
//     if (object) {
//         console.log('Подсказка:', object.properties);
//         return {
//             html: `\
//   <div><b>ID:</b> ${object.properties.id}</div>
//   <div><b>Name:</b> ${object.properties.name}</div>
//   <div><b>Population:</b> ${object.properties.population}</div>
//   <div><b>Area:</b> ${object.properties.area} km²</div>
//   `
//         };
//     }
//     return null;
// }

// const MapComponent = ({
//     data = DATA_URL,
//     mapStyle = MAP_STYLE
// }) => {
//     const [effects] = useState(() => {
//         const lightingEffect = new LightingEffect({ ambientLight, dirLight });
//         lightingEffect.shadowColor = [0, 0, 0, 0.5];
//         console.log('Освещение и тени настроены');
//         return [lightingEffect];
//     });

//     const [geoJsonData, setGeoJsonData] = useState(null);

//     // Загрузка данных
//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 const response = await fetch(data);
//                 const json = await response.json();
//                 console.log('Данные GeoJSON загружены:', json);
//                 setGeoJsonData(json);
//             } catch (error) {
//                 console.error('Ошибка загрузки данных GeoJSON:', error);
//             }
//         };

//         loadData();
//     }, [data]);

//     const layers = [
//         // Слой GeoJSON
//         new GeoJsonLayer({
//             id: 'geojson',
//             data: geoJsonData,
//             opacity: 0.8,
//             stroked: false,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => f.properties.population / 1000, // Высота зависит от населения
//             getFillColor: f => COLOR_SCALE(f.properties.area), // Цвет зависит от площади
//             getLineColor: [255, 255, 255],
//             pickable: true,
//             onDataLoad: () => console.log('Слой GeoJSON загружен'),
//             onAfterRender: () => console.log('Слой GeoJSON отрисован')
//         })
//     ];

//     return (
//         <DeckGL
//             layers={layers}
//             effects={effects}
//             initialViewState={INITIAL_VIEW_STATE}
//             controller={true}
//             getTooltip={getTooltip}
//             onLoad={() => console.log('DeckGL загружен')}
//             onAfterRender={() => console.log('DeckGL отрисован')}
//         >
//             <Map reuseMaps mapStyle={mapStyle} onLoad={() => console.log('Карта загружена')} />
//         </DeckGL>
//     );
// };

// export default MapComponent;


// Первый вариант Клавдии

// import React, { useState, useEffect } from 'react';
// import { Map } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { GeoJsonLayer } from '@deck.gl/layers';
// import { scaleThreshold } from 'd3-scale';

// // Data URLs
// const REGIONS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/regions_filtered_min.json';
// const DISTRICTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/refs/heads/main/landkreisestaedte_min.json';
// const CITIES_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/kreisfreiestaedte_min.json';

// // Color scales for different layers
// const REGIONS_COLOR_SCALE = scaleThreshold()
//     .domain([5000, 7500, 10000, 12500, 15000])
//     .range([
//         [158, 1, 66],    // Темно-красный
//         [213, 62, 79],   // Красный
//         [244, 109, 67],  // Оранжево-красный
//         [253, 174, 97],  // Светло-оранжевый
//         [254, 224, 139]  // Желтый
//     ]);

// const DISTRICTS_COLOR_SCALE = scaleThreshold()
//     .domain([500, 1000, 1500, 2000, 2500])
//     .range([
//         [37, 52, 148],   // Темно-синий
//         [44, 127, 184],  // Синий
//         [65, 182, 196],  // Голубой
//         [127, 205, 187], // Бирюзовый
//         [199, 233, 180]  // Светло-зеленый
//     ]);

// const CITIES_COLOR_SCALE = scaleThreshold()
//     .domain([100, 200, 300, 400, 500])
//     .range([
//         [27, 120, 55],   // Темно-зеленый
//         [56, 166, 91],   // Зеленый
//         [109, 192, 124], // Светло-зеленый
//         [177, 221, 161], // Очень светлый зеленый
//         [230, 245, 208]  // Почти белый зеленый
//     ]);

// // Initial view state
// const INITIAL_VIEW_STATE = {
//     latitude: 48.5,
//     longitude: 12.5,
//     zoom: 6,
//     maxZoom: 16,
//     pitch: 45,
//     bearing: 0
// };

// // Map style
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

// function getTooltip({ object }) {
//     if (object) {
//         return {
//             html: `\
// <div><b>ID:</b> ${object.properties.id}</div>
// <div><b>Name:</b> ${object.properties.name}</div>
// <div><b>Population:</b> ${object.properties.population}</div>
// <div><b>Area:</b> ${object.properties.area} km²</div>
// `
//         };
//     }
//     return null;
// }

// const MapComponent = ({
//     mapStyle = MAP_STYLE
// }) => {
//     const [regionsData, setRegionsData] = useState(null);
//     const [districtsData, setDistrictsData] = useState(null);
//     const [citiesData, setCitiesData] = useState(null);

//     // Load all data
//     useEffect(() => {
//         const loadData = async (url, setData) => {
//             try {
//                 const response = await fetch(url);
//                 const json = await response.json();
//                 setData(json);
//             } catch (error) {
//                 console.error('Error loading GeoJSON data:', error);
//             }
//         };

//         loadData(REGIONS_URL, setRegionsData);
//         loadData(DISTRICTS_URL, setDistrictsData);
//         loadData(CITIES_URL, setCitiesData);
//     }, []);

//     const layers = [
//         // Layer 1: Regions (красно-желтая палитра)
//         new GeoJsonLayer({
//             id: 'regions',
//             data: regionsData,
//             opacity: 0.6,
//             stroked: true,
//             filled: false,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => f.properties.population / 1000,
//             getFillColor: f => REGIONS_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         }),
//         // Layer 2: Districts (сине-зеленая палитра)
//         new GeoJsonLayer({
//             id: 'districts',
//             data: districtsData,
//             opacity: 0.7,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => f.properties.population / 1000,
//             getFillColor: f => DISTRICTS_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         }),
//         // Layer 3: Cities (зеленая палитра)
//         new GeoJsonLayer({
//             id: 'cities',
//             data: citiesData,
//             opacity: 0.8,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => f.properties.population / 1000,
//             getFillColor: f => CITIES_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         })
//     ];

//     return (
//         <DeckGL
//             layers={layers}
//             initialViewState={INITIAL_VIEW_STATE}
//             controller={true}
//             getTooltip={getTooltip}
//         >
//             <Map reuseMaps mapStyle={mapStyle} />
//         </DeckGL>
//     );
// };

// export default MapComponent;

// // Второй вариант Клавдии
// import React, { useState, useEffect } from 'react';
// import { Map } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { GeoJsonLayer } from '@deck.gl/layers';
// import { scaleThreshold } from 'd3-scale';

// // Data URLs
// const REGIONS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/regions_filtered_min.json';
// const DISTRICTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/refs/heads/main/landkreisestaedte_min.json';
// const CITIES_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/kreisfreiestaedte_min.json';

// // Color scales for different layers
// const REGIONS_COLOR_SCALE = scaleThreshold()
//     .domain([5000, 7500, 10000, 12500, 15000])
//     .range([
//         [158, 1, 66, 180],    // Темно-красный с прозрачностью
//         [213, 62, 79, 180],   // Красный с прозрачностью
//         [244, 109, 67, 180],  // Оранжево-красный с прозрачностью
//         [253, 174, 97, 180],  // Светло-оранжевый с прозрачностью
//         [254, 224, 139, 180]  // Желтый с прозрачностью
//     ]);

// const DISTRICTS_COLOR_SCALE = scaleThreshold()
//     .domain([500, 1000, 1500, 2000, 2500])
//     .range([
//         [37, 52, 148, 200],   // Темно-синий с прозрачностью
//         [44, 127, 184, 200],  // Синий с прозрачностью
//         [65, 182, 196, 200],  // Голубой с прозрачностью
//         [127, 205, 187, 200], // Бирюзовый с прозрачностью
//         [199, 233, 180, 200]  // Светло-зеленый с прозрачностью
//     ]);

// const CITIES_COLOR_SCALE = scaleThreshold()
//     .domain([100, 200, 300, 400, 500])
//     .range([
//         [27, 120, 55, 255],   // Темно-зеленый
//         [56, 166, 91, 255],   // Зеленый
//         [109, 192, 124, 255], // Светло-зеленый
//         [177, 221, 161, 255], // Очень светлый зеленый
//         [230, 245, 208, 255]  // Почти белый зеленый
//     ]);

// // Initial view state
// const INITIAL_VIEW_STATE = {
//     latitude: 48.5,
//     longitude: 12.5,
//     zoom: 6,
//     maxZoom: 16,
//     pitch: 45,
//     bearing: 0
// };

// // Map style
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

// function getTooltip({ object }) {
//     if (object) {
//         return {
//             html: `\
// <div><b>ID:</b> ${object.properties.id}</div>
// <div><b>Name:</b> ${object.properties.name}</div>
// <div><b>Population:</b> ${object.properties.population}</div>
// <div><b>Area:</b> ${object.properties.area} km²</div>
// `
//         };
//     }
//     return null;
// }

// const MapComponent = ({
//     mapStyle = MAP_STYLE
// }) => {
//     const [regionsData, setRegionsData] = useState(null);
//     const [districtsData, setDistrictsData] = useState(null);
//     const [citiesData, setCitiesData] = useState(null);

//     useEffect(() => {
//         const loadData = async (url, setData) => {
//             try {
//                 const response = await fetch(url);
//                 const json = await response.json();
//                 setData(json);
//             } catch (error) {
//                 console.error('Error loading GeoJSON data:', error);
//             }
//         };

//         loadData(REGIONS_URL, setRegionsData);
//         loadData(DISTRICTS_URL, setDistrictsData);
//         loadData(CITIES_URL, setCitiesData);
//     }, []);

//     const layers = [
//         // Layer 1: Regions (теперь только границы)
//         new GeoJsonLayer({
//             id: 'regions',
//             data: regionsData,
//             stroked: true,
//             filled: false,
//             lineWidthMinPixels: 3,
//             getLineColor: [158, 1, 66],
//             pickable: true
//         }),
//         // Layer 2: Districts
//         new GeoJsonLayer({
//             id: 'districts',
//             data: districtsData,
//             opacity: 0.8,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => f.properties.population / 1000,
//             getFillColor: f => DISTRICTS_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         }),
//         // Layer 3: Cities
//         new GeoJsonLayer({
//             id: 'cities',
//             data: citiesData,
//             opacity: 1,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => (f.properties.population / 1000) * 1.5, // Сделаем города повыше
//             getFillColor: f => CITIES_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         })
//     ];

//     return (
//         <DeckGL
//             layers={layers}
//             initialViewState={INITIAL_VIEW_STATE}
//             controller={true}
//             getTooltip={getTooltip}
//         >
//             <Map reuseMaps mapStyle={mapStyle} />
//         </DeckGL>
//     );
// };

// export default MapComponent;


// Третий вариант Клавдии с городами

// import React, { useState, useEffect } from 'react';
// import { Map } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
// import { scaleThreshold, scaleLinear } from 'd3-scale';

// // Data URLs
// const REGIONS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/regions_filtered_min.json';
// const DISTRICTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/refs/heads/main/landkreisestaedte_min.json';
// const CITIES_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/kreisfreiestaedte_min.json';
// const CITY_POINTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/cities/091/merged_result.geojson';

// // Color scales for different layers
// const REGIONS_COLOR_SCALE = scaleThreshold()
//     .domain([5000, 7500, 10000, 12500, 15000])
//     .range([
//         [158, 1, 66, 180],
//         [213, 62, 79, 180],
//         [244, 109, 67, 180],
//         [253, 174, 97, 180],
//         [254, 224, 139, 180]
//     ]);

// const DISTRICTS_COLOR_SCALE = scaleThreshold()
//     .domain([500, 1000, 1500, 2000, 2500])
//     .range([
//         [37, 52, 148, 200],
//         [44, 127, 184, 200],
//         [65, 182, 196, 200],
//         [127, 205, 187, 200],
//         [199, 233, 180, 200]
//     ]);

// const CITIES_COLOR_SCALE = scaleThreshold()
//     .domain([100, 200, 300, 400, 500])
//     .range([
//         [27, 120, 55, 255],
//         [56, 166, 91, 255],
//         [109, 192, 124, 255],
//         [177, 221, 161, 255],
//         [230, 245, 208, 255]
//     ]);

// // Шкалы для точек городов
// const POINT_SIZE_SCALE = scaleLinear()
//     .domain([0, 100]) // будет автоматически обновлено на основе реальных данных
//     .range([100, 2000]);

// const POINT_COLOR_SCALE = scaleLinear()
//     .domain([0, 50000]) // будет автоматически обновлено на основе реальных данных
//     .range([[255, 255, 178], [189, 0, 38]]); // от светло-желтого до темно-красного

// // Initial view state
// const INITIAL_VIEW_STATE = {
//     latitude: 48.5,
//     longitude: 12.5,
//     zoom: 6,
//     maxZoom: 16,
//     pitch: 45,
//     bearing: 0
// };

// // Map style
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

// function getTooltip({ object }) {
//     if (!object) return null;

//     if (object.properties) {
//         return {
//             html: `\
// <div><b>ID:</b> ${object.properties.id}</div>
// <div><b>Name:</b> ${object.properties.name}</div>
// <div><b>Population:</b> ${object.properties.population}</div>
// <div><b>Area:</b> ${object.properties.area} km²</div>
// `
//         };
//     }

//     // Для точек городов (если данные приходят в другом формате)
//     return {
//         html: `\
// <div><b>Name:</b> ${object.properties.name}</div>
// <div><b>Population:</b> ${object.properties.population}</div>
// <div><b>Area:</b> ${object.properties.area} km²</div>
// `
//     };
// }

// const MapComponent = ({
//     mapStyle = MAP_STYLE
// }) => {
//     const [regionsData, setRegionsData] = useState(null);
//     const [districtsData, setDistrictsData] = useState(null);
//     const [citiesData, setCitiesData] = useState(null);
//     const [cityPointsData, setCityPointsData] = useState(null);

//     useEffect(() => {
//         const loadData = async (url, setData) => {
//             try {
//                 const response = await fetch(url);
//                 const json = await response.json();
//                 setData(json);

//                 // // Обновляем шкалы для точек при загрузке данных
//                 // if (url === CITY_POINTS_URL && json.features) {
//                 //     const areas = json.features.map(f => f.properties.area);
//                 //     const populations = json.features.map(f => f.properties.population);

//                 //     POINT_SIZE_SCALE.domain([Math.min(...areas), Math.max(...areas)]);
//                 //     POINT_COLOR_SCALE.domain([Math.min(...populations), Math.max(...populations)]);
//                 // }
//             } catch (error) {
//                 console.error('Error loading GeoJSON data:', error);
//             }
//         };

//         loadData(REGIONS_URL, setRegionsData);
//         loadData(DISTRICTS_URL, setDistrictsData);
//         loadData(CITIES_URL, setCitiesData);
//         loadData(CITY_POINTS_URL, setCityPointsData);
//     }, []);

//     const layers = [
//         // Layer 1: Regions (только границы)
//         new GeoJsonLayer({
//             id: 'regions',
//             data: regionsData,
//             stroked: true,
//             filled: false,
//             lineWidthMinPixels: 3,
//             getLineColor: [158, 1, 66],
//             pickable: true
//         }),
//         // Layer 2: Districts
//         new GeoJsonLayer({
//             id: 'districts',
//             data: districtsData,
//             opacity: 0.8,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => f.properties.population / 1000,
//             getFillColor: f => DISTRICTS_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         }),
//         // Layer 3: Cities
//         new GeoJsonLayer({
//             id: 'cities',
//             data: citiesData,
//             opacity: 1,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => (f.properties.population / 1000) * 1.5,
//             getFillColor: f => CITIES_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         }),
//         // Layer 4: City Points
//         new ScatterplotLayer({
//             id: 'city-points',
//             data: cityPointsData?.features || [],
//             pickable: true,
//             opacity: 0.8,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             radiusScale: 1,
//             radiusMinPixels: 2,
//             radiusMaxPixels: 30,
//             lineWidthMinPixels: 1,
//             getElevation: d => (d.properties.population * 5.5),
//             getPosition: d => d.geometry.coordinates,
//             getRadius: d => POINT_SIZE_SCALE(d.properties.area),
//             getFillColor: d => POINT_COLOR_SCALE(d.properties.population),
//             getLineColor: [255, 255, 255],
//             parameters: {
//                 // Включаем depth test, но точки всегда будут отрисовываться поверх других слоев
//                 depthTest: false
//             },
//             onClick: info => console.log('Clicked:', info.object.properties)
//         })
//     ];

//     console.log("Layers array (Region + Districts + Cities):", layers);

//     return (
//         <DeckGL
//             layers={layers}
//             initialViewState={INITIAL_VIEW_STATE}
//             controller={true}
//             getTooltip={getTooltip}
//         >
//             <Map reuseMaps mapStyle={mapStyle} />
//         </DeckGL>
//     );
// };

// export default MapComponent;


// 4 вариант Клавдии с городами


// import React, { useState, useEffect } from 'react';
// import { Map } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
// import { scaleThreshold, scaleLinear } from 'd3-scale';

// // Data URLs
// const REGIONS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/regions_filtered_min.json';
// const DISTRICTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/refs/heads/main/landkreisestaedte_min.json';
// const CITIES_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/kreisfreiestaedte_min.json';
// const CITY_POINTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/cities/091/cities_in _region_091.geojson';

// // Color scales for different layers
// const REGIONS_COLOR_SCALE = scaleThreshold()
//     .domain([5000, 7500, 10000, 12500, 15000])
//     .range([
//         [158, 1, 66, 180],
//         [213, 62, 79, 180],
//         [244, 109, 67, 180],
//         [253, 174, 97, 180],
//         [254, 224, 139, 180]
//     ]);

// const DISTRICTS_COLOR_SCALE = scaleThreshold()
//     .domain([500, 1000, 1500, 2000, 2500])
//     .range([
//         [37, 52, 148, 200],
//         [44, 127, 184, 200],
//         [65, 182, 196, 200],
//         [127, 205, 187, 200],
//         [199, 233, 180, 200]
//     ]);

// const CITIES_COLOR_SCALE = scaleThreshold()
//     .domain([100, 200, 300, 400, 500])
//     .range([
//         [27, 120, 55, 255],
//         [56, 166, 91, 255],
//         [109, 192, 124, 255],
//         [177, 221, 161, 255],
//         [230, 245, 208, 255]
//     ]);

// // Шкалы для точек городов (теперь обе от population)
// const POINT_SIZE_SCALE = scaleLinear()
//     .domain([0, 50000]) // будет автоматически обновлено
//     .range([200, 5000]);

// const POINT_COLOR_SCALE = scaleLinear()
//     .domain([0, 50000]) // будет автоматически обновлено
//     .range([[255, 255, 178], [189, 0, 38]]); // от светло-желтого до темно-красного

// // Initial view state
// const INITIAL_VIEW_STATE = {
//     latitude: 48.5,
//     longitude: 12.5,
//     zoom: 8,
//     maxZoom: 16,
//     pitch: 45,
//     bearing: 0
// };

// // Map style
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

// function getTooltip({ object }) {
//     if (!object) return null;

//     if (object.properties) {
//         return {
//             html: `\
// <div><b>Name:</b> ${object.properties.id}</div>
// <div><b>Name:</b> ${object.properties.name}</div>
// <div><b>Population:</b> ${object.properties.population.toLocaleString()}</div>
// <div><b>Area:</b> ${object.properties.area} km²</div>
// `
//         };
//     }
//     return null;
// }


// // Компонент информационной панели
// const InfoPanel = ({ selectedDistrict, districtData, cityPointsData }) => {
//     if (!selectedDistrict) {
//         return (
//             <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow">
//                 <p className="text-gray-500 text-lg">Выберите район для просмотра информации</p>
//             </div>
//         );
//     }

//     // Находим данные выбранного района
//     const district = districtData?.features.find(f => f.properties.id === selectedDistrict);

//     // Находим все города в этом районе
//     const citiesInDistrict = cityPointsData?.features.filter(
//         f => f.properties['land-id'] === selectedDistrict
//     ) || [];

//     // Считаем общую популяцию городов в районе
//     const totalCityPopulation = citiesInDistrict.reduce(
//         (sum, city) => sum + (city.properties.population || 0),
//         0
//     );

//     return (
//         <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow space-y-4">
//             <div className="border-b pb-2">
//                 <h2 className="text-xl font-semibold text-gray-800">
//                     {district?.properties.name || 'Район'}
//                 </h2>
//                 <p className="text-sm text-gray-500">ID: {selectedDistrict}</p>
//             </div>

//             <div className="space-y-2">
//                 <div>
//                     <p className="font-medium text-gray-700">Площадь</p>
//                     <p className="text-gray-600">{district?.properties.area.toLocaleString()} км²</p>
//                 </div>
//                 <div>
//                     <p className="font-medium text-gray-700">Количество городов</p>
//                     <p className="text-gray-600">{citiesInDistrict.length}</p>
//                 </div>
//                 <div>
//                     <p className="font-medium text-gray-700">Общая популяция</p>
//                     <p className="text-gray-600">{totalCityPopulation.toLocaleString()} чел.</p>
//                 </div>
//             </div>

//             <div className="mt-4">
//                 <h3 className="font-medium text-gray-700 mb-2">Города:</h3>
//                 <div className="max-h-48 overflow-y-auto space-y-1">
//                     {citiesInDistrict.map(city => (
//                         <div
//                             key={city.properties.id}
//                             className="text-sm text-gray-600 hover:bg-gray-100 p-1 rounded"
//                         >
//                             {city.properties.name} - {city.properties.population.toLocaleString()} чел.
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };




// const MapComponent = ({
//     mapStyle = MAP_STYLE
// }) => {
//     const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
//     const [regionsData, setRegionsData] = useState(null);
//     const [districtsData, setDistrictsData] = useState(null);
//     const [citiesData, setCitiesData] = useState(null);
//     const [cityPointsData, setCityPointsData] = useState(null);
//     const [selectedDistrictId, setSelectedDistrictId] = useState(null);

//     useEffect(() => {
//         const loadData = async (url, setData) => {
//             try {
//                 const response = await fetch(url);
//                 const json = await response.json();
//                 setData(json);

//                 // Обновляем шкалы для точек при загрузке данных
//                 if (url === CITY_POINTS_URL && json.features) {
//                     const populations = json.features.map(f => f.properties.population);
//                     const maxPop = Math.max(...populations);
//                     const minPop = Math.min(...populations);

//                     POINT_SIZE_SCALE.domain([minPop, maxPop]);
//                     POINT_COLOR_SCALE.domain([minPop, maxPop]);
//                 }
//             } catch (error) {
//                 console.error('Error loading GeoJSON data:', error);
//             }
//         };

//         loadData(REGIONS_URL, setRegionsData);
//         loadData(DISTRICTS_URL, setDistrictsData);
//         loadData(CITIES_URL, setCitiesData);
//         loadData(CITY_POINTS_URL, setCityPointsData);
//     }, []);

//     const layers = [
//         // Layer 1: Regions (только границы)
//         new GeoJsonLayer({
//             id: 'regions',
//             data: regionsData,
//             stroked: true,
//             filled: false,
//             getLineWidth: 2,           // фиксированная толщина в пикселях
//             lineWidthMinPixels: 2,     // минимальная толщина
//             lineWidthMaxPixels: 10,    // максимальная толщина
//             getLineColor: [158, 1, 66],
//             pickable: true
//         }),
//         // Layer 2: Districts
//         new GeoJsonLayer({
//             id: 'districts',
//             data: districtsData,
//             opacity: 0.8,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => f.properties.population / 1000,
//             getFillColor: f => DISTRICTS_COLOR_SCALE(f.properties.area),
//             getLineColor: [50, 50, 255],
//             getLineWidth: 2,           // фиксированная толщина в пикселях
//             lineWidthMinPixels: 3,     // минимальная толщина
//             lineWidthMaxPixels: 10,    // максимальная толщина
//             pickable: true,
//             onClick: (info) => {
//                 // При клике меняем выбранный район
//                 if (info.object) {
//                     setSelectedDistrictId(info.object.properties.id);
//                 }
//             }
//         }),
//         // Layer 3: Cities
//         new GeoJsonLayer({
//             id: 'cities',
//             data: citiesData,
//             opacity: 1,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => (f.properties.population / 1000) * 1.5,
//             getFillColor: f => CITIES_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         }),
//     ];

//     // Добавляем слой точек отдельно, чтобы он всегда был поверх остальных
//     if (cityPointsData) {
//         layers.push(
//             new ScatterplotLayer({
//                 id: 'city-points',
//                 // Фильтруем города по выбранному району
//                 data: cityPointsData.features.filter(f =>
//                     selectedDistrictId === false || // показываем/не показываем все города, если район не выбран null/false
//                     f.properties['land-id'] === selectedDistrictId // показываем города только выбранного района
//                 ),
//                 pickable: true,
//                 opacity: 0.8,
//                 stroked: true,
//                 filled: true,
//                 radiusScale: 1,
//                 radiusMinPixels: 3,
//                 radiusMaxPixels: 30,
//                 lineWidthMinPixels: 1,
//                 getPosition: d => d.geometry.coordinates,
//                 getRadius: d => POINT_SIZE_SCALE(d.properties.population),
//                 getFillColor: d => POINT_COLOR_SCALE(d.properties.population),
//                 getLineColor: [255, 255, 255],
//                 parameters: {
//                     // Включаем depth test, но точки всегда будут отрисовываться поверх других слоев
//                     depthTest: false
//                 },
//                 updateTriggers: {
//                     getRadius: [POINT_SIZE_SCALE],
//                     getFillColor: [POINT_COLOR_SCALE]
//                 }
//             })
//         );
//     }

//     return (
//         <div className="flex h-screen">
//             {/* Карта */}
//             <div className="flex-1">
//                 <DeckGL
//                     layers={layers}
//                     initialViewState={INITIAL_VIEW_STATE}
//                     controller={true}
//                     getTooltip={getTooltip}
//                 >
//                     <Map
//                         reuseMaps
//                         mapStyle={MAP_STYLE}
//                         preventStyleDiffing={true}
//                     />
//                 </DeckGL>
//             </div>

//             {/* Информационная панель */}
//             <div className="w-96 bg-gray-50 p-4 overflow-y-auto">
//                 <InfoPanel
//                     selectedDistrict={selectedDistrictId}
//                     districtData={districtsData}
//                     cityPointsData={cityPointsData}
//                 />
//             </div>
//         </div>
//     );
// };

// export default MapComponent;

//5 Вариант Клавдии


// import React, { useState, useEffect } from 'react';
// import { Map } from 'react-map-gl/maplibre';
// import DeckGL from '@deck.gl/react';
// import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
// import { scaleThreshold, scaleLinear } from 'd3-scale';

// // Data URLs
// const REGIONS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/regions_filtered_min.json';
// const DISTRICTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/refs/heads/main/landkreisestaedte_min.json';
// const CITIES_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/kreisfreiestaedte_min.json';
// const CITY_POINTS_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main/cities/091/cities_in _region_091.geojson';

// // Color scales for different layers
// const REGIONS_COLOR_SCALE = scaleThreshold()
//     .domain([5000, 7500, 10000, 12500, 15000])
//     .range([
//         [158, 1, 66, 180],
//         [213, 62, 79, 180],
//         [244, 109, 67, 180],
//         [253, 174, 97, 180],
//         [254, 224, 139, 180]
//     ]);

// const DISTRICTS_COLOR_SCALE = scaleThreshold()
//     .domain([500, 1000, 1500, 2000, 2500])
//     .range([
//         [37, 52, 148, 200],
//         [44, 127, 184, 200],
//         [65, 182, 196, 200],
//         [127, 205, 187, 200],
//         [199, 233, 180, 200]
//     ]);

// const CITIES_COLOR_SCALE = scaleThreshold()
//     .domain([100, 200, 300, 400, 500])
//     .range([
//         [27, 120, 55, 255],
//         [56, 166, 91, 255],
//         [109, 192, 124, 255],
//         [177, 221, 161, 255],
//         [230, 245, 208, 255]
//     ]);

// // Шкалы для точек городов (теперь обе от population)
// const POINT_SIZE_SCALE = scaleLinear()
//     .domain([0, 50000]) // будет автоматически обновлено
//     .range([200, 5000]);

// const POINT_COLOR_SCALE = scaleLinear()
//     .domain([0, 50000]) // будет автоматически обновлено
//     .range([[255, 255, 178], [189, 0, 38]]); // от светло-желтого до темно-красного

// // Initial view state
// const INITIAL_VIEW_STATE = {
//     latitude: 48.5,
//     longitude: 12.5,
//     zoom: 8,
//     maxZoom: 16,
//     pitch: 45,
//     bearing: 0
// };

// // Map style
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

// function getTooltip({ object }) {
//     if (!object) return null;

//     if (object.properties) {
//         return {
//             html: `\
// <div><b>Name:</b> ${object.properties.id}</div>
// <div><b>Name:</b> ${object.properties.name}</div>
// <div><b>Population:</b> ${object.properties.population.toLocaleString()}</div>
// <div><b>Area:</b> ${object.properties.area} km²</div>
// `
//         };
//     }
//     return null;
// }


// // Компонент информационной панели
// const InfoPanel = ({ info, onCityClick, highlightedCityId }) => {
//     if (!info) {
//         return (
//             <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow">
//                 <p className="text-gray-500 text-lg">
//                     Наведите курсор на регион для просмотра информации
//                 </p>
//             </div>
//         );
//     }

//     if (info.type === 'region') {
//         return (
//             <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow space-y-4">
//                 <div className="border-b pb-2">
//                     <h2 className="text-xl font-semibold text-gray-800">
//                         {info.data.properties.name}
//                     </h2>
//                 </div>
//                 <div className="space-y-2">
//                     <div>
//                         <p className="font-medium text-gray-700">Площадь</p>
//                         <p className="text-gray-600">
//                             {info.data.properties.area.toLocaleString()} км²
//                         </p>
//                     </div>
//                     <div>
//                         <p className="font-medium text-gray-700">Население</p>
//                         <p className="text-gray-600">
//                             {info.data.properties.population.toLocaleString()} чел.
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     if (info.type === 'district') {
//         return (
//             <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow space-y-4">
//                 <div className="border-b pb-2">
//                     <h2 className="text-xl font-semibold text-gray-800">
//                         {info.data.properties.name}
//                     </h2>
//                 </div>
//                 <div className="space-y-2">
//                     <div>
//                         <p className="font-medium text-gray-700">Площадь</p>
//                         <p className="text-gray-600">
//                             {info.data.properties.area.toLocaleString()} км²
//                         </p>
//                     </div>
//                     <div>
//                         <p className="font-medium text-gray-700">Количество городов</p>
//                         <p className="text-gray-600">{info.cities.length}</p>
//                     </div>
//                 </div>
//                 <div className="mt-4">
//                     <h3 className="font-medium text-gray-700 mb-2">Города:</h3>
//                     <div className="max-h-48 overflow-y-auto space-y-1">
//                         {info.cities.map(city => (
//                             <div
//                                 key={city.properties.id}
//                                 className={`text-sm p-1 rounded cursor-pointer transition-colors ${city.properties.id === highlightedCityId
//                                     ? 'bg-orange-100 text-orange-700'
//                                     : 'text-gray-600 hover:bg-gray-100'
//                                     }`}
//                                 onClick={() => onCityClick(city.properties.id)}
//                             >
//                                 {city.properties.name} - {
//                                     city.properties.population.toLocaleString()
//                                 } чел.
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return null;
// };




// const MapComponent = ({
//     // regionsData,
//     // districtsData,
//     // citiesData,
//     // cityPointsData,
//     mapStyle = MAP_STYLE
// }) => {
//     const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
//     const [regionsData, setRegionsData] = useState(null);
//     const [districtsData, setDistrictsData] = useState(null);
//     const [citiesData, setCitiesData] = useState(null);
//     const [cityPointsData, setCityPointsData] = useState(null);
//     const [selectedDistrictId, setSelectedDistrictId] = useState(null);
//     const [hoveredRegionId, setHoveredRegionId] = useState(null);
//     const [selectedRegionId, setSelectedRegionId] = useState(null);
//     const [highlightedCityId, setHighlightedCityId] = useState(null);

//     useEffect(() => {
//         const loadData = async (url, setData) => {
//             try {
//                 const response = await fetch(url);
//                 const json = await response.json();
//                 setData(json);

//                 // Обновляем шкалы для точек при загрузке данных
//                 if (url === CITY_POINTS_URL && json.features) {
//                     const populations = json.features.map(f => f.properties.population);
//                     const maxPop = Math.max(...populations);
//                     const minPop = Math.min(...populations);

//                     POINT_SIZE_SCALE.domain([minPop, maxPop]);
//                     POINT_COLOR_SCALE.domain([minPop, maxPop]);
//                 }
//             } catch (error) {
//                 console.error('Error loading GeoJSON data:', error);
//             }
//         };

//         loadData(REGIONS_URL, setRegionsData);
//         loadData(DISTRICTS_URL, setDistrictsData);
//         loadData(CITIES_URL, setCitiesData);
//         loadData(CITY_POINTS_URL, setCityPointsData);
//     }, []);

//     const layers = [
//         // Layer 1: Regions (только границы)
//         new GeoJsonLayer({
//             id: 'regions',
//             data: regionsData,
//             opacity: 0.8,
//             stroked: true,
//             filled: true,
//             extruded: false,
//             pickable: true,
//             // visible: !selectedRegionId, // скрываем при выборе региона
//             getFillColor: f =>
//                 hoveredRegionId === f.properties.id
//                     ? [255, 140, 0, 120]
//                     : [200, 200, 200, 100],
//             getLineColor: [100, 100, 100],
//             lineWidthMinPixels: 2,
//             onHover: (info) => {
//                 setHoveredRegionId(info.object ? info.object.properties.id : null);
//             },
//             onClick: (info) => {
//                 if (info.object) {
//                     setSelectedRegionId(info.object.properties.id);
//                     setSelectedDistrictId(null);
//                 }
//             }
//         }),
//         // Layer 2: Districts
//         new GeoJsonLayer({
//             id: 'districts',
//             data: districtsData,
//             visible: selectedRegionId && !selectedDistrictId,
//             opacity: 0.8,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             pickable: true,
//             // Фильтруем края по выбранному региону
//             filterData: f => f.properties.region_id === selectedRegionId,
//             getFillColor: f => DISTRICTS_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             getElevation: f => f.properties.population / 1000,
//             onClick: (info) => {
//                 if (info.object) {
//                     setSelectedDistrictId(info.object.properties.id);
//                 }
//             }
//         }),
//         // Layer 3: Cities
//         new GeoJsonLayer({
//             id: 'cities',
//             data: citiesData,
//             visible: selectedRegionId && !selectedDistrictId,
//             opacity: 1,
//             stroked: true,
//             filled: true,
//             extruded: true,
//             wireframe: true,
//             getElevation: f => (f.properties.population / 1000) * 1.5,
//             getFillColor: f => CITIES_COLOR_SCALE(f.properties.area),
//             getLineColor: [255, 255, 255],
//             lineWidthMinPixels: 1,
//             pickable: true
//         }),
//     ];

//     // Добавляем слой точек отдельно, чтобы он всегда был поверх остальных
//     if (cityPointsData) {
//         layers.push(
//             new ScatterplotLayer({
//                 id: 'city-points',
//                 data: cityPointsData?.features || [],
//                 visible: selectedDistrictId !== null,
//                 pickable: true,
//                 opacity: 0.8,
//                 stroked: true,
//                 filled: true,
//                 radiusScale: 1,
//                 radiusMinPixels: 5,
//                 radiusMaxPixels: 30,
//                 lineWidthMinPixels: 1,
//                 // Фильтруем города по выбранному краю
//                 filterData: f => f.properties['land-id'] === selectedDistrictId,
//                 getPosition: d => d.geometry.coordinates,
//                 getRadius: d => POINT_SIZE_SCALE(d.properties.population),
//                 getFillColor: d =>
//                     d.properties.id === highlightedCityId
//                         ? [255, 165, 0, 255] // оранжевый для подсвеченного города
//                         : POINT_COLOR_SCALE(d.properties.population),
//                 getLineColor: [255, 255, 255],
//                 parameters: {
//                     depthTest: false
//                 }
//             })
//         );
//     }

//     // Получаем информацию для панели
//     const getPanelInfo = () => {
//         if (hoveredRegionId && !selectedRegionId) {
//             const region = regionsData?.features.find(
//                 f => f.properties.id === hoveredRegionId
//             );
//             return {
//                 type: 'region',
//                 data: region
//             };
//         }
//         if (selectedDistrictId) {
//             const district = districtsData?.features.find(
//                 f => f.properties.id === selectedDistrictId
//             );
//             const cities = cityPointsData?.features.filter(
//                 f => f.properties['land-id'] === selectedDistrictId
//             );
//             return {
//                 type: 'district',
//                 data: district,
//                 cities
//             };
//         }
//         return null;
//     };


//     return (
//         <div className="flex h-screen">
//             {/* Карта */}
//             <div className="flex-1">
//                 <DeckGL
//                     layers={layers}
//                     initialViewState={INITIAL_VIEW_STATE}
//                     controller={true}
//                     getTooltip={getTooltip}
//                 >
//                     <Map
//                         reuseMaps
//                         mapStyle={MAP_STYLE}
//                         preventStyleDiffing={true}
//                     />
//                 </DeckGL>
//             </div>

//             {/* Информационная панель */}
//             <div className="w-96 bg-gray-50 p-4 overflow-y-auto">
//                 <InfoPanel
//                     info={getPanelInfo()}
//                     onCityClick={setHighlightedCityId}
//                     highlightedCityId={highlightedCityId}
//                 />
//             </div>
//         </div>
//     );
// };

// export default MapComponent;


import React from 'react';
import DeckGL from '@deck.gl/react';
import { TextLayer } from 'deck.gl';

const MapComponent = () => {
    const layers = [
        new TextLayer({
            id: 'simple-text-layer-test',
            data: [{ position: [10, 50], text: 'Hello DeckGL!' }], // ОЧЕНЬ ПРОСТЫЕ ЗАХАРДКОЖЕННЫЕ ДАННЫЕ
            getPosition: d => d.position,
            getText: d => d.text,
            getSize: 72,
            getColor: [255, 0, 0] // Красный цвет, большой размер
        })
    ];

    const initialViewState = {
        longitude: 10,
        latitude: 50,
        zoom: 4,
        pitch: 0,
        bearing: 0
    };

    return (
        <div style={{ height: '100vh', width: '100vw' }}> {/* Задаем размеры контейнера карты */}
            <DeckGL
                initialViewState={initialViewState}
                layers={layers}
                controller={true}
            >
                {/* Ничего внутри DeckGL */}
            </DeckGL>
        </div>
    );
};

export default MapComponent;