import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Map, useControl } from '@vis.gl/react-maplibre';
import SidePanel from './SidePanel';
import { formatArea, formatDensity, formatPeople } from '../map/format';
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

function DeckOverlay(props) {
    const overlay = useControl(() => new MapboxOverlay({ ...props, interleaved: true }));
    overlay.setProps(props);
    return null;
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
        </div>
    );
}

const BavariaMapThree = () => {
    const data = useBavariaData();
    const [selection, dispatch] = useReducer(selectionReducer, window.location.hash, selectionFromHash);
    const [hoveredRegionId, setHoveredRegionId] = useState(null);
    const { regionId, districtId, cityKey: selectedCityKey } = selection;
    const windowSize = useWindowSize();

    // Esc goes one level up, like a click on an empty part of the map.
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') dispatch({ type: 'back' });
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    // Keep the URL hash in sync with the selection (replaceState: no history entry per click).
    useEffect(() => {
        const hash = selectionToHash(selection);
        if (hash !== window.location.hash) {
            const { pathname, search } = window.location;
            window.history.replaceState(null, '', `${pathname}${search}${hash}`);
        }
    }, [selection]);

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

    const hoveredRegion = useMemo(
        () => data.regions?.find(r => r.properties.id === hoveredRegionId) ?? null,
        [data.regions, hoveredRegionId]
    );

    // Layers are rebuilt only when their data or the selection changes, not on hover.
    const glowLayers = useMemo(() => boundaryGlowLayers(data.boundary), [data.boundary]);
    const regionLayer = useMemo(
        () => data.regions && regionsLayer(data.regions, regionId),
        [data.regions, regionId]
    );
    const labelsLayer = useMemo(
        () => data.regions && regionLabelsLayer(data.regions, regionId),
        [data.regions, regionId]
    );
    const districtLayer = useMemo(
        () => districtsLayer(regionDistricts, districtId),
        [regionDistricts, districtId]
    );
    const districtNamesLayer = useMemo(
        () => districtLabelsLayer(regionDistricts, districtId),
        [regionDistricts, districtId]
    );
    const citiesLayer = useMemo(
        () => cityPointsLayer(visibleCities, selectedCityKey),
        [visibleCities, selectedCityKey]
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
        setHoverInfo(object?.properties ? { object, layerId: layer.id, x, y } : null);
        // deck.gl can report the layer without an object (e.g. when the pointer leaves it).
        const id = !regionId && layer?.id === 'regions' ? object?.properties?.id ?? null : null;
        setHoveredRegionId(prev => (prev === id ? prev : id));
        // A hand over everything clickable; MapLibre shows its grab cursor elsewhere.
        const canvas = mapRef.current?.getCanvas();
        if (canvas) canvas.style.cursor = object ? 'pointer' : '';
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
                initialViewState={initialViewState.current}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                onLoad={(e) => {
                    setBeforeId(firstLabelLayerId(e.target));
                    setMapLoaded(true);
                }}
            >
                <DeckOverlay
                    layers={layers}
                    onClick={handleClick}
                    onHover={handleHover}
                />
            </Map>
            {hoverInfo && <MapTooltip info={hoverInfo} />}
            <SidePanel
                selection={selection}
                dispatch={dispatch}
                region={region}
                hoveredRegion={hoveredRegion}
                districts={regionDistricts}
                district={district}
                cities={visibleCities}
                city={selectedCity}
            />
        </div>
    );
};

export default BavariaMapThree;
