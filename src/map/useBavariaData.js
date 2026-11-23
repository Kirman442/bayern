import { useEffect, useState } from 'react';
import centroid from '@turf/centroid';

// Built by scripts/prepare-data.mjs and served from public/data, next to the app.
const dataUrl = (name) => `${import.meta.env.BASE_URL}data/${name}`;

const MUNICH_ID = '09162';

async function loadJson(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
}

// Landkreise and kreisfreie Städte share one layer; `kind` in the data tells them apart.
// The map labels use the short name, the panel and tooltips the full one.
function withDisplayNames(districts) {
    return districts.features.map(f => {
        const prefix = f.properties.kind === 'landkreis'
            ? 'Landkreis'
            : f.properties.id === MUNICH_ID ? 'Landeshauptstadt' : 'Kreisfreie Stadt';
        return {
            ...f,
            centroid: centroid(f).geometry.coordinates,
            properties: { ...f.properties, shortName: f.properties.name, name: `${prefix} ${f.properties.name}` },
        };
    });
}

/**
 * Loads all map data once. The regions are needed for the first render; the rest
 * arrives in the background and is filtered in memory when the user selects something.
 */
export default function useBavariaData() {
    const [data, setData] = useState({
        boundary: null,
        regions: null,
        districts: [],
        cities: [],
        error: null,
    });

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        const fail = (error) => {
            if (signal.aborted) return;
            console.error('Error loading map data:', error);
            setData(d => ({ ...d, error }));
        };

        loadJson(dataUrl('regions.json'), signal)
            .then(json => {
                const regions = json.features.map(f => ({
                    ...f,
                    centroid: centroid(f).geometry.coordinates,
                }));
                setData(d => ({ ...d, regions }));
            })
            .catch(fail);

        loadJson(dataUrl('boundary.json'), signal)
            .then(boundary => setData(d => ({ ...d, boundary })))
            .catch(fail);

        loadJson(dataUrl('districts.json'), signal)
            .then(json => setData(d => ({ ...d, districts: withDisplayNames(json) })))
            .catch(fail);

        loadJson(dataUrl('cities.json'), signal)
            .then(json => setData(d => ({ ...d, cities: json.features })))
            .catch(fail);

        return () => controller.abort();
    }, []);

    return data;
}
