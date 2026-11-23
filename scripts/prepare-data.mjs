// Builds the map data in public/data from the source files in github.com/Kirman442/deckgl.
// Run with `npm run data` after the source data changes; the output is committed.
//
// - polygons are simplified for zoom 6–10 and coordinates rounded to ~1 m
// - Landkreise and kreisfreie Städte go into one file with a `kind` field
// - all Gemeinden go into one file with only the fields the app uses
import { mkdir, writeFile } from 'node:fs/promises';
import mapshaper from 'mapshaper';

const { applyCommands } = mapshaper;

const SOURCE = 'https://raw.githubusercontent.com/Kirman442/deckgl/main';
const OUT = new URL('../public/data/', import.meta.url);
const REGION_CODES = ['091', '092', '093', '094', '095', '096', '097'];
const PROPS = ['id', 'name', 'population', 'population_man', 'population_woman', 'area'];

async function fetchJson(path) {
    const response = await fetch(`${SOURCE}/${path}`);
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
}

const pick = (obj, keys) => Object.fromEntries(keys.filter(k => k in obj).map(k => [k, obj[k]]));
const cleanName = (name) => name.trim().replace(/[,;]+$/, '');

function cleanFeatures(geojson, extra = {}) {
    return {
        type: 'FeatureCollection',
        features: geojson.features.map(f => ({
            type: 'Feature',
            geometry: f.geometry,
            properties: { ...pick(f.properties, PROPS), name: cleanName(f.properties.name), ...extra },
        })),
    };
}

// Simplifies with mapshaper; layers passed together keep their shared borders aligned.
async function simplify(inputs, percent) {
    const names = Object.keys(inputs);
    const cmd = `-i ${names.join(' ')} combine-files -simplify ${percent}% keep-shapes ` +
        `-o format=geojson geojson-type=FeatureCollection precision=0.00001`;
    const output = await applyCommands(cmd, Object.fromEntries(
        names.map(n => [n, JSON.stringify(inputs[n])])
    ));
    return Object.fromEntries(names.map(n => [n, JSON.parse(output[n])]));
}

async function write(name, data) {
    const json = JSON.stringify(data);
    await writeFile(new URL(name, OUT), json);
    console.log(`${name}: ${(json.length / 1024).toFixed(0)} KB`);
}

await mkdir(OUT, { recursive: true });

const [boundary, regions, landkreise, staedte, ...cityFiles] = await Promise.all([
    fetchJson('boundaries/germany_bayern_boundaries.json'),
    fetchJson('regions_filtered_min.json'),
    fetchJson('landkreisestaedte_min.json'),
    fetchJson('kreisfreiestaedte_min.json'),
    ...REGION_CODES.map(code => fetchJson(`cities/${code}/cities_region_${code}.geojson`)),
]);

const outline = await simplify({ 'boundary.json': { ...boundary, features: boundary.features.map(f => ({ ...f, properties: {} })) } }, 20);
await write('boundary.json', outline['boundary.json']);

const regionShapes = await simplify({ 'regions.json': cleanFeatures(regions) }, 20);
await write('regions.json', regionShapes['regions.json']);

const districtShapes = await simplify({
    'landkreise.json': cleanFeatures(landkreise, { kind: 'landkreis' }),
    'staedte.json': cleanFeatures(staedte, { kind: 'stadt' }),
}, 15);
await write('districts.json', {
    type: 'FeatureCollection',
    features: [...districtShapes['landkreise.json'].features, ...districtShapes['staedte.json'].features],
});

const round = (n) => Math.round(n * 1e5) / 1e5;
await write('cities.json', {
    type: 'FeatureCollection',
    features: cityFiles.flatMap(file => file.features).map(f => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: f.geometry.coordinates.map(round) },
        properties: { ...pick(f.properties, [...PROPS, 'land-id']), name: cleanName(f.properties.name) },
    })),
});
