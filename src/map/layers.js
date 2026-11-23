import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { scaleLinear, scaleThreshold } from 'd3-scale';
import { cityKey } from './selection';

const HIGHLIGHT_COLOR = [23, 86, 118, 250];

const density = (d) => d.properties.population / d.properties.area;

export const DISTRICTS_COLOR_SCALE = scaleThreshold()
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

const POINT_SIZE_SCALE = scaleLinear()
    .domain([0, 30000])
    .range([500, 3000]);

const POINT_COLOR_SCALE = scaleLinear()
    .domain([0, 50000])
    .range([[255, 255, 255], [189, 0, 38]]);

// Soft shadow around the border of Bavaria, drawn as three lines of decreasing width.
export function boundaryGlowLayers(boundary) {
    if (!boundary) return [];
    return [
        { id: 'outer', width: 10, opacity: 0.1 },
        { id: 'middle', width: 5, opacity: 0.2 },
        { id: 'inner', width: 2, opacity: 0.3 },
    ].map(({ id, width, opacity }) => new GeoJsonLayer({
        id: `border-glow-${id}`,
        data: boundary,
        filled: false,
        stroked: true,
        pickable: false,
        opacity,
        getLineColor: [0, 0, 0],
        lineWidthMinPixels: width,
        lineJointRounded: true,
        parameters: {
            blend: true,
            depthTest: true,
            blendFunc: [
                WebGLRenderingContext.SRC_ALPHA,
                WebGLRenderingContext.ONE_MINUS_SRC_ALPHA
            ]
        }
    }));
}

export function regionsLayer(regions, selectedRegionId) {
    const isSelected = (d) => d.properties.id === selectedRegionId;
    return new GeoJsonLayer({
        id: 'regions',
        data: regions,
        pickable: true,
        // Hover highlight only before a Bezirk is chosen; afterwards the districts are the target.
        autoHighlight: !selectedRegionId,
        highlightColor: HIGHLIGHT_COLOR,
        stroked: false,
        filled: true,
        extruded: true,
        lineWidthScale: 1,
        wireframe: true,
        lineWidthMinPixels: 1,
        getFillColor: d => {
            if (isSelected(d)) return [100, 150, 255, 200];
            if (selectedRegionId) return [100, 100, 100, 100];
            return [65, 182, 230, 180];
        },
        getLineColor: [255, 255, 230, 20],
        getElevation: d => density(d) * 5,
        updateTriggers: {
            getFillColor: [selectedRegionId],
        }
    });
}

export function regionLabelsLayer(regions) {
    return new TextLayer({
        id: 'regions-labels',
        data: regions,
        getPosition: d => d.centroid,
        getText: d => d.properties.name,
        getSize: 16,
        getColor: [255, 255, 255, 100],
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        parameters: {
            depthTest: false
        }
    });
}

// Landkreise and kreisfreie Städte of the selected Bezirk.
export function districtsLayer(districts, selectedDistrictId) {
    if (districts.length === 0) return null;
    return new GeoJsonLayer({
        id: 'districts',
        data: districts,
        pickable: true,
        autoHighlight: true,
        highlightColor: HIGHLIGHT_COLOR,
        stroked: true,
        filled: true,
        extruded: true,
        wireframe: true,
        getElevation: d => {
            const isStadt = d.properties.kind === 'stadt';
            const isSelected = d.properties.id === selectedDistrictId;
            if (isStadt) return density(d) * (isSelected ? 5 : 3);
            return density(d) * (isSelected ? 65 : 20);
        },
        getFillColor: d => {
            if (d.properties.id === selectedDistrictId) return HIGHLIGHT_COLOR;
            return d.properties.kind === 'stadt'
                ? CITIES_COLOR_SCALE(d.properties.population)
                : DISTRICTS_COLOR_SCALE(d.properties.area);
        },
        getLineColor: [255, 255, 255, 50],
        lineWidthMinPixels: 1,
        transitions: {
            getElevation: 500,
        },
        updateTriggers: {
            getFillColor: [selectedDistrictId],
            getElevation: [selectedDistrictId]
        }
    });
}

// Gemeinden as circles; the selected one is drawn bigger and blue.
export function cityPointsLayer(cities, selectedCityKey) {
    if (cities.length === 0) return null;
    return new ScatterplotLayer({
        id: 'city-points',
        data: cities,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: .8,
        radiusMinPixels: 3,
        radiusMaxPixels: 25,
        lineWidthMinPixels: 1,
        getPosition: d => d.geometry.coordinates,
        getRadius: d => cityKey(d) === selectedCityKey
            ? POINT_SIZE_SCALE(d.properties.population * 10)
            : POINT_SIZE_SCALE(d.properties.population * 1.5),
        getFillColor: d => cityKey(d) === selectedCityKey
            ? [100, 150, 255, 200]
            : POINT_COLOR_SCALE(d.properties.population * 1.5),
        getLineColor: [255, 255, 255],
        parameters: {
            depthTest: false
        },
        updateTriggers: {
            getFillColor: [selectedCityKey],
            getRadius: [selectedCityKey]
        }
    });
}
