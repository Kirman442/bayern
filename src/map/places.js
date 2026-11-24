// What the side panel shows: every map object as a "place" with one shape, whatever its level.
import { cityKey } from './selection';

export const density = (p) => p.population / p.area;

const KIND_LABELS = {
    bayern: 'Freistaat',
    region: 'Regierungsbezirk',
    landkreis: 'Landkreis',
    stadt: 'Kreisfreie Stadt',
    city: 'Gemeinde',
};

export function regionPlace(feature) {
    const p = feature.properties;
    return { kind: 'region', key: p.id, title: p.name, label: KIND_LABELS.region, props: p };
}

export function districtPlace(feature) {
    const p = feature.properties;
    return { kind: 'district', key: p.id, title: p.shortName, label: KIND_LABELS[p.kind], props: p };
}

export function cityPlace(feature) {
    const p = feature.properties;
    return { kind: 'city', key: cityKey(feature), title: p.name, label: KIND_LABELS.city, props: p };
}

// The whole of Bavaria, summed from the Bezirke.
export function bayernPlace(regions) {
    const props = { name: 'Bayern', population: 0, population_man: 0, population_woman: 0, area: 0 };
    for (const r of regions) {
        for (const k of ['population', 'population_man', 'population_woman', 'area']) props[k] += r.properties[k];
    }
    return { kind: 'bayern', key: 'bayern', title: 'Bayern', label: KIND_LABELS.bayern, props };
}

// Rank (1 = largest) of every feature by population and by density, keyed like the places.
export function rankTable(features, keyOf) {
    const rank = (value) => {
        const sorted = [...features].sort((a, b) => value(b.properties) - value(a.properties));
        return new Map(sorted.map((f, i) => [keyOf(f), i + 1]));
    };
    return {
        total: features.length,
        population: rank(p => p.population),
        density: rank(density),
    };
}
