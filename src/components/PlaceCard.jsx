import { formatArea, formatInt, formatPercent, formatUrban } from '../map/format';
import { density } from '../map/places';

const oneDecimal = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const Stat = ({ label, value }) => (
    <div className="stat">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
    </div>
);

// Männer and Frauen as one split bar.
const GenderBar = ({ men, women }) => {
    const share = men / (men + women);
    return (
        <div className="gender">
            <div className="gender-bar" aria-hidden="true">
                <span className="men" style={{ width: `${share * 100}%` }} />
                <span className="women" />
            </div>
            <div className="gender-legend">
                <span>Männer {formatPercent(share)} · {formatInt(men)}</span>
                <span>Frauen {formatPercent(1 - share)} · {formatInt(women)}</span>
            </div>
        </div>
    );
};

/**
 * Card for the current place (Bayern, Bezirk, Kreis or Gemeinde).
 * extra: one more stat for the grid, e.g. the number of Gemeinden.
 * context: { share: { of, value }, rank: { population, density, total, of } } or null.
 */
const PlaceCard = ({ place, extra, context }) => {
    const p = place.props;
    const stats = [
        ['Einwohner', formatInt(p.population)],
        ['Fläche', formatArea(p.area)],
        ['Dichte', `${oneDecimal.format(density(p))} /km²`],
    ];
    if (p.urban) stats.push(['Verstädterung', formatUrban(p.urban, true)]);
    else if (extra) stats.push(extra);

    return (
        <section className="place-card" aria-label={place.title}>
            <div className="place-label">{place.label}</div>
            <h2 className="place-title">{place.title}</h2>
            <div className="stats">
                {stats.map(([label, value]) => <Stat key={label} label={label} value={value} />)}
            </div>
            <GenderBar men={p.population_man} women={p.population_woman} />
            {context && (
                <div className="place-context">
                    {context.share && <div>{formatPercent(context.share.value)} der Einwohner {context.share.of}</div>}
                    {context.rank && (
                        <div>
                            Platz {context.rank.population} von {formatInt(context.rank.total)} {context.rank.of} nach
                            Einwohnern, Platz {context.rank.density} nach Dichte
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default PlaceCard;
