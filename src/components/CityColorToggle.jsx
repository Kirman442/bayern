import { URBAN_CLASSES } from '../map/scales';

const MODES = [
    { value: 'population', label: 'Einwohner' },
    { value: 'urban', label: 'Verstädterung' },
];

// Small box on the map, shown while Gemeinden are visible: picks what their colour means.
// In 'urban' mode it also carries the three-class legend (circle size still = Einwohner).
const CityColorToggle = ({ mode, onChange }) => (
    <div className="city-color-toggle">
        <div className="city-color-toggle-title">Gemeinden färben nach</div>
        <div className="city-color-toggle-buttons" role="radiogroup" aria-label="Gemeinden färben nach">
            {MODES.map(m => (
                <button
                    key={m.value}
                    role="radio"
                    aria-checked={mode === m.value}
                    className={mode === m.value ? 'active' : ''}
                    onClick={() => onChange(m.value)}
                >
                    {m.label}
                </button>
            ))}
        </div>
        {mode === 'urban' && (
            <ul className="city-color-toggle-legend">
                {URBAN_CLASSES.map(c => (
                    <li key={c.value}>
                        <span className="swatch" style={{ background: `rgb(${c.color.join(',')})` }} />
                        {c.short} <span className="hint">({c.label})</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default CityColorToggle;
