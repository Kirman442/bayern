import { GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { cityKey } from './selection';
import { CITY_COLOR_SCALE, CITY_RADIUS_SCALE, DENSITY_COLOR_SCALE, density } from './scales';

// Warm colours stand out against the blue-green density scale; hover is lighter than selection.
const HOVER_COLOR = [254, 196, 79, 255];
const SELECTED_COLOR = [253, 141, 60, 255];
const CITY_OUTLINE = [45, 45, 60, 220];
const LABEL_FONT = 'system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Soft shadow around the border of Bavaria, drawn as three lines of decreasing width.
export function boundaryGlowLayers(boundary) {
    if (!boundary) return [];
    return [
        { id: 'outer', width: 8, opacity: 0.06 },
        { id: 'middle', width: 4, opacity: 0.12 },
        { id: 'inner', width: 1.5, opacity: 0.3 },
    ].map(({ id, width, opacity }) => new GeoJsonLayer({
        id: `border-glow-${id}`,
        data: boundary,
        filled: false,
        stroked: true,
        pickable: false,
        // Alpha in the colour rather than layer opacity: the interleaved map ignored the latter.
        getLineColor: [0, 0, 0, Math.round(opacity * 255)],
        lineWidthMinPixels: width,
        lineJointRounded: true,
    }));
}

// Hover is drawn from state (hoveredId) instead of deck.gl's autoHighlight: autoHighlight
// also lit the polygon under a Gemeinde point and flickered between the two.
export function regionsLayer(regions, selectedRegionId, hoveredId) {
    return new GeoJsonLayer({
        id: 'regions',
        data: regions,
        pickable: true,
        // Flat polygons: density is shown by colour alone, nothing hides behind a raised Bezirk.
        stroked: true,
        filled: true,
        lineWidthUnits: 'pixels',
        getLineWidth: 1.5,
        // Once a Bezirk is chosen its districts carry the colour; every Bezirk steps back into
        // a light neutral (under the districts it only shows in slivers along the borders).
        // Overview: Bezirke on the same density scale as the Landkreise and the legend.
        // Hover highlight only before a Bezirk is chosen; afterwards the districts are the target.
        getFillColor: d => {
            if (selectedRegionId) return [236, 238, 242, 200];
            if (d.properties.id === hoveredId) return HOVER_COLOR;
            return DENSITY_COLOR_SCALE(density(d));
        },
        getLineColor: [255, 255, 255, 230],
        updateTriggers: {
            getFillColor: [selectedRegionId, hoveredId],
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
        fontFamily: LABEL_FONT,
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

// Names of the Landkreise and kreisfreie Städte of the selected Bezirk; kreisfreie Städte are
// set darker. A Landkreis named like its kreisfreie Stadt (Augsburg, Passau, …) usually lies
// around it, so only one of the two names is shown: the Stadt, unless the Landkreis is selected.
// (deck.gl's CollisionFilterExtension does not work with the map interleaved into MapLibre.)
export function districtLabelsLayer(districts, selectedDistrictId) {
    if (districts.length === 0) return null;
    const byName = new Map();
    districts.forEach(d => {
        const list = byName.get(d.properties.shortName) ?? [];
        byName.set(d.properties.shortName, [...list, d]);
    });
    const visible = districts.filter(d => {
        const twins = byName.get(d.properties.shortName);
        if (twins.length === 1) return true;
        const selectedTwin = twins.find(t => t.properties.id === selectedDistrictId);
        if (selectedTwin) return d === selectedTwin;
        return d.properties.kind === 'stadt';
    });
    return new TextLayer({
        id: 'district-labels',
        data: visible,
        getPosition: d => d.centroid,
        getText: d => d.properties.shortName,
        getSize: d => (d.properties.kind === 'stadt' ? 13 : 12),
        getColor: d => d.properties.kind === 'stadt' ? [20, 24, 50, 255] : [55, 60, 80, 235],
        fontFamily: LABEL_FONT,
        fontWeight: 600,
        background: true,
        getBackgroundColor: d => d.properties.id === selectedDistrictId
            ? [255, 236, 214, 235]
            : [255, 255, 255, 190],
        backgroundPadding: [4, 1],
        characterSet: 'auto',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        parameters: { depthTest: false },
        updateTriggers: { getBackgroundColor: [selectedDistrictId] },
    });
}

// Landkreise and kreisfreie Städte of the selected Bezirk.
export function districtsLayer(districts, selectedDistrictId, hoveredId) {
    if (districts.length === 0) return null;
    return new GeoJsonLayer({
        id: 'districts',
        data: districts,
        pickable: true,
        stroked: true,
        filled: true,
        getFillColor: d => {
            // The selected district keeps its colour under the pointer.
            if (d.properties.id === selectedDistrictId) return SELECTED_COLOR;
            if (d.properties.id === hoveredId) return HOVER_COLOR;
            return DENSITY_COLOR_SCALE(density(d));
        },
        // White borders between neighbours; the selected one gets a dark, wider outline.
        lineWidthUnits: 'pixels',
        getLineColor: d => d.properties.id === selectedDistrictId ? [60, 30, 10, 255] : [255, 255, 255, 220],
        getLineWidth: d => d.properties.id === selectedDistrictId ? 2.5 : 1,
        updateTriggers: {
            getFillColor: [selectedDistrictId, hoveredId],
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
