import { useCallback, useMemo, useReducer, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from '@vis.gl/react-maplibre';
import SidePanel from './SidePanel';
import useBavariaData from '../map/useBavariaData';
import { cityKey, initialSelection, selectionReducer } from '../map/selection';
import {
    boundaryGlowLayers,
    cityPointsLayer,
    districtsLayer,
    regionLabelsLayer,
    regionsLayer,
} from '../map/layers';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE = {
    longitude: 11.4,
    latitude: 48.5,
    zoom: 7,
    maxZoom: 10,
    minZoom: 6,
    pitch: 33,
    bearing: 0
};

const regionCode = (id) => id.slice(0, 3);

function getTooltip({ object }) {
    if (!object?.properties?.['land-id']) return null;
    const p = object.properties;
    return {
        html: `
            <div><b>Stadt / Gemeinde</b></div>
            <div><b>Name:</b> ${p.name}</div>
            <div><b>Bevölkerung:</b> ${p.population.toLocaleString()}</div>
            <div><b>Fläche:</b> ${p.area} km²</div>
        `
    };
}

const BavariaMapThree = () => {
    const data = useBavariaData();
    const [selection, dispatch] = useReducer(selectionReducer, initialSelection);
    const [hoveredRegionId, setHoveredRegionId] = useState(null);
    const { regionId, districtId, cityKey: selectedCityKey } = selection;

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
    const labelsLayer = useMemo(() => data.regions && regionLabelsLayer(data.regions), [data.regions]);
    const districtLayer = useMemo(
        () => districtsLayer(regionDistricts, districtId),
        [regionDistricts, districtId]
    );
    const citiesLayer = useMemo(
        () => cityPointsLayer(visibleCities, selectedCityKey),
        [visibleCities, selectedCityKey]
    );
    const layers = [...glowLayers, regionLayer, districtLayer, labelsLayer, citiesLayer].filter(Boolean);

    const handleClick = useCallback(({ object, layer }) => {
        if (!object) {
            dispatch({ type: 'reset' });
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
    const handleHover = useCallback(({ object, layer }) => {
        const id = !regionId && layer?.id === 'regions' ? object.properties.id : null;
        setHoveredRegionId(prev => (prev === id ? prev : id));
    }, [regionId]);

    if (data.error && !data.regions) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Die Daten konnten nicht geladen werden.</div>
            </div>
        );
    }

    if (!data.regions) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Daten werden geladen…</div>
            </div>
        );
    }

    return (
        <div style={{ width: '800px', height: '600px' }} >
            <DeckGL
                layers={layers}
                initialViewState={INITIAL_VIEW_STATE}
                controller={true}
                getTooltip={getTooltip}
                onClick={handleClick}
                onHover={handleHover}
            >
                <Map mapStyle={MAP_STYLE} />
            </DeckGL>
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
