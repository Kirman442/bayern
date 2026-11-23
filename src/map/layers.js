import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { cityKey } from './selection';
import { CITY_COLOR_SCALE, CITY_RADIUS_SCALE, DENSITY_COLOR_SCALE, density } from './scales';

// Warm colours stand out against the blue-green density scale; hover is lighter than selection.
const HOVER_COLOR = [254, 196, 79, 255];
const SELECTED_COLOR = [253, 141, 60, 255];
const CITY_OUTLINE = [45, 45, 60, 220];

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
    return new GeoJsonLayer({
        id: 'regions',
        data: regions,
        pickable: true,
        // Hover highlight only before a Bezirk is chosen; afterwards the districts are the target.
        autoHighlight: !selectedRegionId,
        highlightColor: HOVER_COLOR,
        // Flat polygons: density is shown by colour alone, nothing hides behind a raised Bezirk.
        stroked: true,
        filled: true,
        lineWidthUnits: 'pixels',
        getLineWidth: 1.5,
        // Once a Bezirk is chosen its districts carry the colour; every Bezirk steps back into
        // a light neutral (under the districts it only shows in slivers along the borders).
        getFillColor: selectedRegionId ? [236, 238, 242, 200] : [65, 182, 230, 200],
        getLineColor: [255, 255, 255, 230],
        updateTriggers: {
            getFillColor: [selectedRegionId],
        }
    });
}

// Bezirk names; the selected Bezirk's name is hidden so it doesn't sit on its districts.
export function regionLabelsLayer(regions, selectedRegionId) {
    return new TextLayer({
        id: 'regions-labels',
        data: regions,
        getPosition: d => d.centroid,
        getText: d => d.properties.name,
        getSize: 15,
        getColor: d => d.properties.id === selectedRegionId ? [0, 0, 0, 0] : [40, 44, 70, 255],
        fontFamily: 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontWeight: 600,
        // A light plate behind the name reads on every fill; an SDF outline smeared the glyphs.
        background: true,
        getBackgroundColor: d => d.properties.id === selectedRegionId ? [0, 0, 0, 0] : [255, 255, 255, 210],
        backgroundPadding: [5, 2],
        characterSet: 'auto',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        parameters: {
            depthTest: false
        },
        updateTriggers: {
            getColor: [selectedRegionId],
            getBackgroundColor: [selectedRegionId],
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
        getFillColor: d => {
            if (d.properties.id === selectedDistrictId) return SELECTED_COLOR;
            return DENSITY_COLOR_SCALE(density(d));
        },
        // White borders between neighbours; the selected one gets a dark, wider outline.
        lineWidthUnits: 'pixels',
        getLineColor: d => d.properties.id === selectedDistrictId ? [60, 30, 10, 255] : [255, 255, 255, 220],
        getLineWidth: d => d.properties.id === selectedDistrictId ? 2.5 : 1,
        updateTriggers: {
            getFillColor: [selectedDistrictId],
            getLineColor: [selectedDistrictId],
            getLineWidth: [selectedDistrictId],
        }
    });
}

// Gemeinden as circles; the selected one is drawn bigger, in orange with a black outline.
export function cityPointsLayer(cities, selectedCityKey) {
    if (cities.length === 0) return null;
    return new ScatterplotLayer({
        id: 'city-points',
        data: cities,
        pickable: true,
        opacity: 0.9,
        autoHighlight: true,
        highlightColor: [255, 255, 0, 255],
        stroked: true,
        filled: true,
        radiusUnits: 'pixels',
        radiusMinPixels: 3,
        lineWidthMinPixels: 1,
        getPosition: d => d.geometry.coordinates,
        getRadius: d => CITY_RADIUS_SCALE(d.properties.population) * (cityKey(d) === selectedCityKey ? 1.6 : 1),
        getFillColor: d => cityKey(d) === selectedCityKey
            ? SELECTED_COLOR
            : CITY_COLOR_SCALE(d.properties.population),
        // A dark outline keeps even the white, small Gemeinden visible on any fill colour.
        getLineColor: d => cityKey(d) === selectedCityKey ? [0, 0, 0, 255] : CITY_OUTLINE,
        getLineWidth: d => cityKey(d) === selectedCityKey ? 2 : 1,
        lineWidthUnits: 'pixels',
        parameters: {
            depthTest: false
        },
        updateTriggers: {
            getFillColor: [selectedCityKey],
            getLineColor: [selectedCityKey],
            getLineWidth: [selectedCityKey],
            getRadius: [selectedCityKey]
        }
    });
}
