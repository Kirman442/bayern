import { useEffect, useRef, useState } from 'react';
import PlaceCard from './PlaceCard';
import PlaceList from './PlaceList';
import { formatInt } from '../map/format';
import { bayernPlace, cityPlace, districtPlace, regionPlace } from '../map/places';

const LEGAL_URL = `${import.meta.env.BASE_URL}legal.html`;

// Bayern › Bezirk › Kreis › Gemeinde; every level above the current one is a link.
const Breadcrumbs = ({ items }) => (
    <nav aria-label="Auswahl" className="crumbs">
        {items.map((item, i) => (
            <span key={item.label} className="crumb">
                {i > 0 && <span aria-hidden="true" className="sep">›</span>}
                {item.onClick
                    ? <button onClick={item.onClick}>{item.label}</button>
                    : <span className="current">{item.label}</span>}
            </span>
        ))}
    </nav>
);

// Phones: the panel is a bottom sheet with three heights; the handle cycles them, a drag picks
// the nearest one. Desktop ignores all of this (see .control-panel in index.css).
const SHEETS = ['peek', 'half', 'full'];

function useSheet(selectionKey) {
    const [sheet, setSheet] = useState('half');
    const drag = useRef(null);
    // A new selection from the map brings a collapsed sheet back up.
    useEffect(() => {
        setSheet(s => (s === 'peek' ? 'half' : s));
    }, [selectionKey]);

    const handleProps = {
        onClick: () => {
            if (drag.current?.moved) return;
            setSheet(s => SHEETS[(SHEETS.indexOf(s) + 1) % SHEETS.length]);
        },
        onPointerDown: (e) => { drag.current = { y: e.clientY, moved: false }; },
        onPointerUp: (e) => {
            if (!drag.current) return;
            const dy = e.clientY - drag.current.y;
            if (Math.abs(dy) > 30) {
                drag.current.moved = true;
                setSheet(s => {
                    const i = SHEETS.indexOf(s) + (dy < 0 ? 1 : -1);
                    return SHEETS[Math.max(0, Math.min(SHEETS.length - 1, i))];
                });
            }
            setTimeout(() => { drag.current = null; }, 0);
        },
    };
    return { sheet, handleProps };
}

/**
 * One view that drills down: the current place on top, then its children (or, for a leaf,
 * its siblings) as a list. The breadcrumbs and Esc go back up.
 */
const SidePanel = ({
    dispatch, regions, region, districts, district, cities, city, ranks, hovered, onHover,
}) => {
    const [sort, setSort] = useState('population');
    const isLandkreis = district?.properties.kind === 'landkreis';
    const bayern = bayernPlace(regions);
    const current = city ? cityPlace(city) : district ? districtPlace(district) : region ? regionPlace(region) : bayern;
    const { sheet, handleProps } = useSheet(current.key);

    const crumbs = [{ label: 'Bayern', onClick: region ? () => dispatch({ type: 'reset' }) : null }];
    if (region) crumbs.push({ label: region.properties.name, onClick: district ? () => dispatch({ type: 'selectRegion', id: region.properties.id }) : null });
    if (district) crumbs.push({ label: district.properties.shortName, onClick: city ? () => dispatch({ type: 'selectDistrict', id: district.properties.id }) : null });
    if (city) crumbs.push({ label: city.properties.name });

    // Children of the current place, or its siblings when it has none.
    let list;
    if (!region) {
        list = { title: 'Regierungsbezirke', places: regions.map(regionPlace), hoveredKey: hovered.region };
    } else if (isLandkreis) {
        list = { title: 'Gemeinden', places: cities.map(cityPlace), hoveredKey: hovered.city, selectedKey: city && cityPlace(city).key };
    } else {
        list = { title: 'Landkreise und kreisfreie Städte', places: districts.map(districtPlace), hoveredKey: hovered.district, selectedKey: district?.properties.id };
    }
    const listId = region ? (isLandkreis ? district.properties.id : region.properties.id) : 'bayern';

    const onSelect = (place) => {
        onHover(null);
        if (place.kind === 'region') dispatch({ type: 'selectRegion', id: place.key });
        else if (place.kind === 'district') dispatch({ type: 'selectDistrict', id: place.key });
        else dispatch({ type: 'selectCity', key: place.key });
    };

    // Grid extra and the "share / rank" line for the card.
    const p = current.props;
    let extra = null;
    let context = null;
    if (current.kind === 'bayern') {
        extra = ['Kreise', formatInt(ranks.districts.total)];
    } else if (current.kind === 'region') {
        extra = ['Kreise', formatInt(districts.length)];
        context = {
            share: { of: 'Bayerns', value: p.population / bayern.props.population },
            rank: { ...pick(ranks.regions, current.key), of: 'Bezirken' },
        };
    } else if (current.kind === 'district') {
        if (isLandkreis) extra = ['Gemeinden', formatInt(cities.length)];
        context = {
            share: { of: 'Bayerns', value: p.population / bayern.props.population },
            rank: { ...pick(ranks.districts, current.key), of: 'Kreisen' },
        };
    } else {
        context = {
            share: { of: 'des Landkreises', value: p.population / district.properties.population },
            rank: { ...pick(ranks.cities, current.key), of: 'kreisangehörigen Gemeinden' },
        };
    }

    return (
        <div className={`control-panel sheet-${sheet}`}>
            <button className="sheet-handle" aria-label="Panel größer oder kleiner" {...handleProps}>
                <span />
            </button>
            {region && <Breadcrumbs items={crumbs} />}
            <PlaceCard place={current} extra={extra} context={context} />
            <PlaceList
                key={listId}
                {...list}
                sort={sort}
                onSort={setSort}
                onSelect={onSelect}
                onHover={onHover}
            />
            <p className="source">
                Stand: 31.12.2025 (Basis Zensus 2022) · Quelle: Bayerisches Landesamt für Statistik / Destatis
                {/* On phones the sheet covers the map's attribution, so the legal links repeat here. */}
                <span className="legal-links">
                    {' · '}<a href={`${LEGAL_URL}#impressum`}>Impressum</a>{' · '}<a href={`${LEGAL_URL}#datenschutz`}>Datenschutz</a>
                </span>
            </p>
        </div>
    );
};

const pick = (table, key) => ({
    population: table.population.get(key),
    density: table.density.get(key),
    total: table.total,
});

export default SidePanel;
