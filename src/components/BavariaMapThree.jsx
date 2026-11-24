import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Map, useControl } from '@vis.gl/react-maplibre';
import SidePanel from './SidePanel';
import LegalModal from './LegalModal';
import MapLegend from './MapLegend';
import { rankTable } from '../map/places';
import { formatArea, formatDensity, formatPeople, formatUrban } from '../map/format';
import { MAX_ZOOM, MIN_ZOOM, boundsOf, viewStateFor } from '../map/camera';
import useBavariaData from '../map/useBavariaData';
import { cityKey, selectionFromHash, selectionReducer, selectionToHash } from '../map/selection';
import {
    boundaryGlowLayers,
    cityPointsLayer,
    districtLabelsLayer,
    districtsLayer,
    regionLabelsLayer,
    regionsLayer,
} from '../map/layers';

// Carto Positron vector style (no API key). deck.gl draws into MapLibre's own WebGL context
// (interleaved), so the polygons can sit below the basemap's place and river names.
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Impressum and Datenschutz sit in MapLibre's attribution ("i"), next to the CARTO credits.
// The links only set the hash; the app opens them as a dialog (see legalFromHash).
const ATTRIBUTION = {
    customAttribution: '<a href="#impressum">Impressum</a> | <a href="#datenschutz">Datenschutz</a>',
};
const LEGAL_IDS = ['impressum', 'datenschutz'];
const legalFromHash = () => LEGAL_IDS.find(id => `#${id}` === window.location.hash) ?? null;

// The overlay applies this to MapLibre's canvas: a hand over everything clickable.
const getCursor = ({ isHovering, isDragging }) =>
    isDragging ? 'grabbing' : isHovering ? 'pointer' : 'grab';

function DeckOverlay(props) {
    const overlay = useControl(() => new MapboxOverlay({ ...props, interleaved: true }));
    overlay.setProps(props);
    return null;
}

// Basemap labels that only add noise at close zoom: street names, house numbers, POIs and the
// names of villages and hamlets (our Gemeinde points already mark those). Matched by layer id
// and by OpenMapTiles source layer, so a renamed layer in Carto's style still falls under it.
const NOISY_LABEL_ID = /road|street|housenum|poi|hamlet|suburb|neighbou?rhood|village|airport|aeroway|rail|transit|shield|building/i;
const NOISY_SOURCE_LAYERS = new Set(['transportation_name', 'housenumber', 'poi', 'aerodrome_label', 'mountain_peak']);

function hideNoisyLabels(map) {
    for (const layer of map.getStyle().layers) {
        if (layer.type !== 'symbol') continue;
        if (NOISY_LABEL_ID.test(layer.id) || NOISY_SOURCE_LAYERS.has(layer['source-layer'])) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
    }
}

// The first symbol layer of the style: map polygons go below it, our own labels above.
function firstLabelLayerId(map) {
    return map.getStyle().layers.find(l => l.type === 'symbol')?.id ?? null;
}

// Phones get the panel as a sheet at the bottom; see .control-panel in index.css.
const MOBILE_BREAKPOINT = 640;
const PANEL_WIDTH = 390;

function useWindowSize() {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    useEffect(() => {
        const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return size;
}

// Space around the fitted area: keep it clear of the panel.
function cameraPadding({ width, height }) {
    if (width <= MOBILE_BREAKPOINT) {
        return { top: 20, left: 20, right: 20, bottom: Math.round(height * 0.45) + 20 };
    }
    return { top: 40, left: 40, bottom: 40, right: Math.min(PANEL_WIDTH, width / 2) + 40 };
}

const regionCode = (id) => id.slice(0, 3);

// Hover card for any map object; drawn by React next to the pointer.
function MapTooltip({ info }) {
    const p = info.object.properties;
    const title = info.layerId === 'city-points' ? 'Stadt / Gemeinde'
        : info.layerId === 'regions' ? 'Bezirk'
            : p.kind === 'stadt' ? 'Kreisfreie Stadt' : 'Landkreis';
    return (
        <div className="map-tooltip" style={{ left: info.x + 16, top: info.y + 18 }}>
            <div><b>{title}</b></div>
            <div><b>Name:</b> {p.name}</div>
            <div><b>Bevölkerung:</b> {formatPeople(p.population)}</div>
            <div><b>Fläche:</b> {formatArea(p.area)}</div>
            <div><b>Dichte:</b> {formatDensity(p)}</div>
            {p.urban && <div><b>Verstädterung:</b> {formatUrban(p.urban)}</div>}
        </div>
    );
}

const BavariaMapThree = () => {
    const data = useBavariaData();
    const [selection, dispatch] = useReducer(selectionReducer, window.location.hash, selectionFromHash);
    const [hoveredRegionId, setHoveredRegionId] = useState(null);
    const [hoveredDistrictId, setHoveredDistrictId] = useState(null);
    const [hoveredCityKey, setHoveredCityKey] = useState(null);
    const { regionId, districtId, cityKey: selectedCityKey } = selection;
    const windowSize = useWindowSize();

    // Impressum / Datenschutz dialog: open while the hash is #impressum or #datenschutz.
    const [legal, setLegal] = useState(legalFromHash);
    useEffect(() => {
        const onHashChange = () => {
            const tab = legalFromHash();
            if (tab) setLegal(tab);
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // Esc closes the dialog, otherwise goes one level up, like a click on an empty part of the map.
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== 'Escape') return;
            if (legal) setLegal(null);
            else dispatch({ type: 'back' });
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [legal]);

    // Keep the URL hash in sync with the selection or the open dialog (replaceState: no history
    // entry per click).
    useEffect(() => {
        const hash = legal ? `#${legal}` : selectionToHash(selection);
        if (hash !== window.location.hash) {
            const { pathname, search } = window.location;
            window.history.replaceState(null, '', `${pathname}${search}${hash}`);
        }
    }, [selection, legal]);

    // Everything the map and the panel show is derived from the selected ids.
    const region = useMemo(
        () => data.regions?.find(r => r.properties.id === regionId) ?? null,
        [data.regions, regionId]
    );
    const regionDistricts = useMemo(
        () => regionId ? data.districts.filter(d => regionCode(d.properties.id) === regionCode(regionId)) : [],
        [data.districts, regionId]
    );
    const district = useMemo(
        () => regionDistricts.find(d => d.properties.id === districtId) ?? null,
        [regionDistricts, districtId]
    );
    const regionCities = useMemo(
        () => regionId ? data.cities.filter(c => regionCode(c.properties['land-id']) === regionCode(regionId)) : [],
        [data.cities, regionId]
    );
    // A Landkreis narrows the Gemeinden to its own; a kreisfreie Stadt has none, so the
    // whole Bezirk stays visible.
    const visibleCities = useMemo(
        () => district?.properties.kind === 'landkreis'
            ? regionCities.filter(c => c.properties['land-id'] === district.properties.id)
            : regionCities,
        [regionCities, district]
    );
    const selectedCity = useMemo(
        () => visibleCities.find(c => cityKey(c) === selectedCityKey) ?? null,
        [visibleCities, selectedCityKey]
    );
    // The camera flies to the selected Landkreis or Bezirk, or shows all of Bavaria.
    const viewState = useMemo(() => {
        const focus = district ? [district] : region ? [region] : data.regions;
        if (!focus) return null;
        return viewStateFor(boundsOf(focus), { ...windowSize, padding: cameraPadding(windowSize) });
    }, [district, region, data.regions, windowSize]);

    // Ranks for the "Platz … von …" line of the card.
    const ranks = useMemo(() => ({
        regions: rankTable(data.regions ?? [], f => f.properties.id),
        districts: rankTable(data.districts, f => f.properties.id),
        cities: rankTable(data.cities, cityKey),
    }), [data.regions, data.districts, data.cities]);

    // A row in the panel list highlights its object on the map, like the pointer does.
    // A row in the panel list highlights its object on the map, like the pointer does. Kept apart
    // from the map's own hover state: deck.gl reports "nothing hovered" a frame after the pointer
    // leaves the map for the panel, which would wipe the row's highlight.
    const [listHover, setListHover] = useState(null);
    const hoverFor = (kind, mapValue) => (listHover ? (listHover.kind === kind ? listHover.key : null) : mapValue);
    const hoverRegion = hoverFor('region', hoveredRegionId);
    const hoverDistrict = hoverFor('district', hoveredDistrictId);
    const hoverCity = hoverFor('city', hoveredCityKey);

    // Layers are rebuilt only when their data or the selection changes, not on hover.
    const glowLayers = useMemo(() => boundaryGlowLayers(data.boundary), [data.boundary]);
    const regionLayer = useMemo(
        () => data.regions && regionsLayer(data.regions, regionId, hoverRegion),
        [data.regions, regionId, hoverRegion]
    );
    const labelsLayer = useMemo(
        () => data.regions && regionLabelsLayer(data.regions, regionId),
        [data.regions, regionId]
    );
    const districtLayer = useMemo(
        () => districtsLayer(regionDistricts, districtId, hoverDistrict),
        [regionDistricts, districtId, hoverDistrict]
    );
    const districtNamesLayer = useMemo(
        () => districtLabelsLayer(regionDistricts, districtId),
        [regionDistricts, districtId]
    );
    const citiesLayer = useMemo(
        () => cityPointsLayer(visibleCities, selectedCityKey, hoverCity),
        [visibleCities, selectedCityKey, hoverCity]
    );
    const [beforeId, setBeforeId] = useState(null);
    const layers = useMemo(() => {
        const under = [...glowLayers, regionLayer, districtLayer].filter(Boolean)
            .map(l => (beforeId ? l.clone({ beforeId }) : l));
        const over = [labelsLayer, citiesLayer, districtNamesLayer].filter(Boolean);
        return [...under, ...over];
    }, [glowLayers, regionLayer, districtLayer, labelsLayer, citiesLayer, districtNamesLayer, beforeId]);

    // The camera follows the selection: fly to every new target after the first one.
    const mapRef = useRef(null);
    // The Map is mounted only once data has loaded, so the first non-null target is its start.
    const initialViewState = useRef(null);
    if (!initialViewState.current && viewState) initialViewState.current = viewState;
    const [mapLoaded, setMapLoaded] = useState(false);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded || !viewState) return;
        const { longitude, latitude, zoom, pitch, bearing } = viewState;
        map.flyTo({ center: [longitude, latitude], zoom, pitch, bearing, duration: 800 });
    }, [viewState, mapLoaded]);

    const handleClick = useCallback(({ object, layer }) => {
        if (!object) {
            dispatch({ type: 'back' });
            return;
        }
        if (layer.id === 'regions') {
            dispatch({ type: 'selectRegion', id: object.properties.id });
        } else if (layer.id === 'districts') {
            dispatch({ type: 'selectDistrict', id: object.properties.id });
        } else if (layer.id === 'city-points') {
            dispatch({ type: 'selectCity', key: cityKey(object) });
        }
    }, []);

    // The panel shows the Bezirk under the cursor until one is selected.
    const [hoverInfo, setHoverInfo] = useState(null);
    const handleHover = useCallback(({ object, layer, x, y }) => {
        const hovered = object?.properties ? { object, layerId: layer.id, x, y } : null;
        setHoverInfo(hovered);
        // Only the polygon directly under the pointer is highlighted, never the one under a Gemeinde.
        const districtHover = hovered?.layerId === 'districts' ? object.properties.id : null;
        setHoveredDistrictId(prev => (prev === districtHover ? prev : districtHover));
        const cityHover = hovered?.layerId === 'city-points' ? cityKey(object) : null;
        setHoveredCityKey(prev => (prev === cityHover ? prev : cityHover));
        // deck.gl can report the layer without an object (e.g. when the pointer leaves it).
        const id = !regionId && layer?.id === 'regions' ? object?.properties?.id ?? null : null;
        setHoveredRegionId(prev => (prev === id ? prev : id));
    }, [regionId]);

    if (data.error && !data.regions) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Die Daten konnten nicht geladen werden.</div>
            </div>
        );
    }

    if (!viewState) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Daten werden geladen…</div>
            </div>
        );
    }

    return (
        <div className="map-root">
            <Map
                ref={mapRef}
                mapStyle={MAP_STYLE}
                attributionControl={ATTRIBUTION}
                initialViewState={initialViewState.current}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                onLoad={(e) => {
                    hideNoisyLabels(e.target);
                    setBeforeId(firstLabelLayerId(e.target));
                    setMapLoaded(true);
                }}
            >
                <DeckOverlay
                    layers={layers}
                    onClick={handleClick}
                    onHover={handleHover}
                    getCursor={getCursor}
                    pickingRadius={4}
                />
            </Map>
            {hoverInfo && <MapTooltip info={hoverInfo} />}
            {legal && <LegalModal tab={legal} onTab={setLegal} onClose={() => setLegal(null)} />}
            <MapLegend showCities={visibleCities.length > 0} />
            <SidePanel
                dispatch={dispatch}
                regions={data.regions}
                region={region}
                districts={regionDistricts}
                district={district}
                cities={visibleCities}
                city={selectedCity}
                ranks={ranks}
                hovered={{ region: hoverRegion, district: hoverDistrict, city: hoverCity }}
                onHover={(place) => setListHover(place && { kind: place.kind, key: place.key })}
            />
        </div>
    );
};

export default BavariaMapThree;
