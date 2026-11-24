// Builds the map data in public/data from the source files in github.com/Kirman442/deckgl.
// Run with `npm run data` after the source data changes; the output is committed.
//
// - polygons are simplified for zoom 6–10 and coordinates rounded to ~1 m
// - Landkreise and kreisfreie Städte go into one file with a `kind` field
// - all Gemeinden go into one file with only the fields the app uses
// - population and area come from the Destatis Gemeindeverzeichnis (GV-ISys) and are
//   merged in by AGS; Landkreise and Regierungsbezirke are sums of their Gemeinden
//   (including gemeindefreie Gebiete, which add area but no population)
import { mkdir, writeFile } from 'node:fs/promises';
import mapshaper from 'mapshaper';
import { readSheet } from 'read-excel-file/node';

const { applyCommands } = mapshaper;

const SOURCE = 'https://raw.githubusercontent.com/Kirman442/deckgl/main';
const OUT = new URL('../public/data/', import.meta.url);
// Stand 31.12.2025, Bevölkerung auf Grundlage des Zensus 2022. For a newer year, change
// the date here and the "Stand" line in src/components/SidePanel.jsx.
const GV_DATE = '31122025';
const GV_URL = 'https://www.destatis.de/DE/Themen/Laender-Regionen/Regionales/Gemeindeverzeichnis/' +
    `Administrativ/Archiv/GVAuszugJ/${GV_DATE}_Auszug_GV.xlsx?__blob=publicationFile`;
// Textkennzeichen of the Gemeindeverzeichnis for kreisangehörige Gemeinden.
const GEMEINDE_TYPES = { '60': 'Markt', '63': 'Stadt', '64': 'Gemeinde', '67': 'Große Kreisstadt' };
const REGION_CODES = ['091', '092', '093', '094', '095', '096', '097'];
const PROPS = ['id', 'name', 'population', 'population_man', 'population_woman', 'area'];

// Reads the Gemeinde rows (Satzart 60) for Bayern and sums them up per Kreis and Bezirk.
// Returns a Map from AGS (09 + RB + Kreis [+ Gem]) or region id (09 + RB) to figures.
async function fetchPopulation() {
    const response = await fetch(GV_URL);
    if (!response.ok) throw new Error(`Gemeindeverzeichnis: HTTP ${response.status}`);
    const rows = await readSheet(Buffer.from(await response.arrayBuffer()), `Onlineprodukt_Gemeinden${GV_DATE}`);
    const figures = new Map();
    const add = (key, values) => {
        const sum = figures.get(key) ?? { population: 0, population_man: 0, population_woman: 0, area: 0 };
        for (const k in sum) sum[k] += values[k];
        figures.set(key, sum);
    };
    for (const row of rows) {
        const [satzart, textkennzeichen, land, rb, kreis, , gem, , area, population, man, woman] = row;
        if (satzart !== '60' || land !== '09') continue;
        const values = { population: population || 0, population_man: man || 0, population_woman: woman || 0, area };
        add(`09${rb}${kreis}${gem}`, values);
        // Grad der Verstädterung (EU DEGURBA): 1 dicht, 2 mittel, 3 gering besiedelt.
        // Only Gemeinden carry it; unpopulated gemeindefreie Gebiete have none.
        if (row[18]) figures.get(`09${rb}${kreis}${gem}`).urban = Number(row[18]);
        // Kind of kreisangehörige Gemeinde from the Textkennzeichen: Stadt, Markt, Gemeinde, …
        if (GEMEINDE_TYPES[textkennzeichen]) figures.get(`09${rb}${kreis}${gem}`).type = GEMEINDE_TYPES[textkennzeichen];
        add(`09${rb}${kreis}`, values);
        add(`09${rb}`, values);
    }
    for (const sum of figures.values()) sum.area = Math.round(sum.area * 100) / 100;
    return figures;
}

// Overwrites population and area with the official figures; fails loudly on a missing AGS.
function withPopulation(features, figures, keyOf) {
    return features.map(f => {
        const key = keyOf(f.properties);
        const values = figures.get(key);
        if (!values) throw new Error(`No population figures for ${key} (${f.properties.name})`);
        return { ...f, properties: { ...f.properties, ...values } };
    });
}

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

const [population, boundary, regions, landkreise, staedte, ...cityFiles] = await Promise.all([
    fetchPopulation(),
    fetchJson('boundaries/germany_bayern_boundaries.json'),
    fetchJson('regions_filtered_min.json'),
    fetchJson('landkreisestaedte_min.json'),
    fetchJson('kreisfreiestaedte_min.json'),
    ...REGION_CODES.map(code => fetchJson(`cities/${code}/cities_region_${code}.geojson`)),
]);

const outline = await simplify({ 'boundary.json': { ...boundary, features: boundary.features.map(f => ({ ...f, properties: {} })) } }, 20);
await write('boundary.json', outline['boundary.json']);

const regionShapes = await simplify({ 'regions.json': cleanFeatures(regions) }, 20);
await write('regions.json', {
    type: 'FeatureCollection',
    features: withPopulation(regionShapes['regions.json'].features, population, p => p.id),
});

const districtShapes = await simplify({
    'landkreise.json': cleanFeatures(landkreise, { kind: 'landkreis' }),
    'staedte.json': cleanFeatures(staedte, { kind: 'stadt' }),
}, 15);
await write('districts.json', {
    type: 'FeatureCollection',
    features: withPopulation(
        [...districtShapes['landkreise.json'].features, ...districtShapes['staedte.json'].features],
        population, p => p.id,
    ),
});

const round = (n) => Math.round(n * 1e5) / 1e5;
await write('cities.json', {
    type: 'FeatureCollection',
    features: withPopulation(cityFiles.flatMap(file => file.features).map(f => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: f.geometry.coordinates.map(round) },
        properties: { ...pick(f.properties, [...PROPS, 'land-id']), name: cleanName(f.properties.name) },
    })), population, p => p['land-id'] + p.id),
});
