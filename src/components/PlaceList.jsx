import { useMemo, useState } from 'react';
import { formatInt } from '../map/format';
import { density } from '../map/places';

const SORTS = [
    { value: 'population', label: 'Einwohner' },
    { value: 'density', label: 'Dichte' },
    { value: 'name', label: 'Name' },
];
// Lists longer than this get a search field.
const SEARCH_FROM = 12;

const metric = (sort) => (sort === 'density' ? (p) => density(p) : (p) => p.population);
const collator = new Intl.Collator('de');

/**
 * Children (or siblings) of the current place: one compact row each, with a bar relative to
 * the largest value in the list. Hovering a row highlights the object on the map.
 */
// sort lives in the panel so it survives moving between levels; the search is per list.
const PlaceList = ({ title, places, selectedKey, hoveredKey, onSelect, onHover, sort, onSort }) => {
    const [query, setQuery] = useState('');

    const value = metric(sort);
    const rows = useMemo(() => {
        const q = query.trim().toLocaleLowerCase('de');
        const filtered = q ? places.filter(pl => pl.title.toLocaleLowerCase('de').includes(q)) : places;
        const byValue = metric(sort);
        return [...filtered].sort(sort === 'name'
            ? (a, b) => collator.compare(a.title, b.title)
            : (a, b) => byValue(b.props) - byValue(a.props));
    }, [places, query, sort]);
    const max = Math.max(...places.map(pl => value(pl.props)));

    return (
        <section className="place-list">
            <div className="place-list-head">
                <h3>{title} <span className="count">{places.length}</span></h3>
                <div className="sort" role="radiogroup" aria-label="Sortieren nach">
                    {SORTS.map(s => (
                        <button
                            key={s.value}
                            role="radio"
                            aria-checked={sort === s.value}
                            className={sort === s.value ? 'active' : ''}
                            onClick={() => onSort(s.value)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
            {places.length > SEARCH_FROM && (
                <input
                    className="place-search"
                    type="search"
                    placeholder="Suchen…"
                    aria-label={`${title} durchsuchen`}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            )}
            <ul onMouseLeave={() => onHover(null)}>
                {rows.map(pl => {
                    const v = value(pl.props);
                    const classes = [
                        pl.key === selectedKey && 'selected',
                        pl.key === hoveredKey && 'hovered',
                    ].filter(Boolean).join(' ');
                    return (
                        <li key={pl.key}>
                            <button
                                className={classes}
                                onClick={() => onSelect(pl)}
                                onMouseEnter={() => onHover(pl)}
                                onFocus={() => onHover(pl)}
                            >
                                <span className="row-name">
                                    {pl.title}
                                    {pl.props.kind === 'stadt' && <span className="tag">Stadt</span>}
                                </span>
                                <span className="row-value">
                                    {sort === 'density' ? `${formatInt(v)} /km²` : formatInt(v)}
                                </span>
                                <span className="row-bar" style={{ width: `${(v / max) * 100}%` }} aria-hidden="true" />
                            </button>
                        </li>
                    );
                })}
                {rows.length === 0 && <li className="empty">Keine Treffer</li>}
            </ul>
        </section>
    );
};

export default PlaceList;
