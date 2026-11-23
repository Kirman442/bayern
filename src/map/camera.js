import { FlyToInterpolator, WebMercatorViewport } from '@deck.gl/core';

export const MIN_ZOOM = 5;
export const MAX_ZOOM = 13;
// Fitting a small Landkreis never zooms in further than this, so its extrusion stays readable.
const MAX_FIT_ZOOM = 8.8;
const PITCH = 33;

// [[west, south], [east, north]] of one or more GeoJSON features.
export function boundsOf(features) {
    let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
    const visit = (coords) => {
        if (typeof coords[0] === 'number') {
            const [x, y] = coords;
            if (x < west) west = x;
            if (x > east) east = x;
            if (y < south) south = y;
            if (y > north) north = y;
        } else {
            coords.forEach(visit);
        }
    };
    features.forEach(f => visit(f.geometry.coordinates));
    return [[west, south], [east, north]];
}

// Camera that fits the bounds into the part of the screen not covered by the panel.
export function viewStateFor(bounds, { width, height, padding }) {
    const viewport = new WebMercatorViewport({ width, height });
    const { longitude, latitude, zoom } = viewport.fitBounds(bounds, { padding });
    return {
        longitude,
        latitude,
        zoom: Math.min(Math.max(zoom, MIN_ZOOM), MAX_FIT_ZOOM),
        pitch: PITCH,
        bearing: 0,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        transitionDuration: 800,
        transitionInterpolator: new FlyToInterpolator(),
    };
}
