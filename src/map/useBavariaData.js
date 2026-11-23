import { useEffect, useState } from 'react';
import centroid from '@turf/centroid';

const DATA_BASE_URL = 'https://raw.githubusercontent.com/Kirman442/deckgl/main';
const BOUNDARY_URL = `${DATA_BASE_URL}/boundaries/germany_bayern_boundaries.json`;
const REGIONS_URL = `${DATA_BASE_URL}/regions_filtered_min.json`;
const DISTRICTS_URL = `${DATA_BASE_URL}/landkreisestaedte_min.json`;
const INDEPENDENT_CITIES_URL = `${DATA_BASE_URL}/kreisfreiestaedte_min.json`;
const REGION_CODES = ['091', '092', '093', '094', '095', '096', '097'];
const citiesUrl = (code) => `${DATA_BASE_URL}/cities/${code}/cities_region_${code}.geojson`;

const MUNICH_ID = '09162';

async function loadJson(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.json();
}

// Landkreise and kreisfreie Städte share one layer; `kind` tells them apart.
function prepareDistricts(districtsJson, citiesJson) {
    const landkreise = districtsJson.features.map(f => ({
        ...f,
        properties: { ...f.properties, kind: 'landkreis', name: `Landkreis ${f.properties.name}` },
    }));
    const staedte = citiesJson.features.map(f => {
        const prefix = f.properties.id === MUNICH_ID ? 'Landeshauptstadt' : 'Kreisfreiestadt';
        return {
            ...f,
            properties: { ...f.properties, kind: 'stadt', name: `${prefix} ${f.properties.name}` },
        };
    });
    return [...landkreise, ...staedte];
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

        loadJson(REGIONS_URL, signal)
            .then(json => {
                const regions = json.features.map(f => ({
                    ...f,
                    centroid: centroid(f).geometry.coordinates,
                }));
                setData(d => ({ ...d, regions }));
            })
            .catch(fail);

        loadJson(BOUNDARY_URL, signal)
            .then(boundary => setData(d => ({ ...d, boundary })))
            .catch(fail);

        Promise.all([loadJson(DISTRICTS_URL, signal), loadJson(INDEPENDENT_CITIES_URL, signal)])
            .then(([districtsJson, citiesJson]) =>
                setData(d => ({ ...d, districts: prepareDistricts(districtsJson, citiesJson) })))
            .catch(fail);

        Promise.all(REGION_CODES.map(code => loadJson(citiesUrl(code), signal)))
            .then(results => setData(d => ({ ...d, cities: results.flatMap(r => r.features) })))
            .catch(fail);

        return () => controller.abort();
    }, []);

    return data;
}
