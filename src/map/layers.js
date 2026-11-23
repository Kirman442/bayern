import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { cityKey } from './selection';
import { CITY_COLOR_SCALE, CITY_RADIUS_SCALE, DENSITY_COLOR_SCALE, density } from './scales';

// Warm colours stand out against the blue-green density scale; hover is lighter than selection.
const HOVER_COLOR = [254, 217, 166, 230];
const SELECTED_COLOR = [253, 141, 60, 240];

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
        highlightColor: HOVER_COLOR,
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
        highlightColor: HOVER_COLOR,
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
            if (d.properties.id === selectedDistrictId) return SELECTED_COLOR;
            return DENSITY_COLOR_SCALE(density(d));
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
        radiusUnits: 'pixels',
        radiusMinPixels: 2,
        lineWidthMinPixels: 1,
        getPosition: d => d.geometry.coordinates,
        getRadius: d => CITY_RADIUS_SCALE(d.properties.population) * (cityKey(d) === selectedCityKey ? 1.6 : 1),
        getFillColor: d => cityKey(d) === selectedCityKey
            ? SELECTED_COLOR
            : CITY_COLOR_SCALE(d.properties.population),
        getLineColor: d => cityKey(d) === selectedCityKey ? [40, 40, 40] : [255, 255, 255],
        parameters: {
            depthTest: false
        },
        updateTriggers: {
            getFillColor: [selectedCityKey],
            getLineColor: [selectedCityKey],
            getRadius: [selectedCityKey]
        }
    });
}
