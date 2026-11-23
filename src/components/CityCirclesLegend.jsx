import { CITY_COLOR_SCALE, CITY_LEGEND_VALUES, CITY_RADIUS_SCALE } from '../map/scales';
import { formatInt } from '../map/format';

// Uses the same scales as the city points on the map; radii are in pixels there too.
const CityCirclesLegend = () => {
    const maxRadius = CITY_RADIUS_SCALE(CITY_LEGEND_VALUES[CITY_LEGEND_VALUES.length - 1]);

    return (
        <div style={{ width: '250px', margin: '10px' }}>
            <div style={{ fontSize: '12px', textAlign: 'center', marginBottom: '6px' }}>
                Gemeinden nach Einwohnerzahl
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
                {CITY_LEGEND_VALUES.map(population => {
                    const r = CITY_RADIUS_SCALE(population);
                    const color = CITY_COLOR_SCALE(population);
                    return (
                        <div key={population} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <svg width={maxRadius * 2 + 4} height={maxRadius * 2 + 4}>
                                <circle
                                    cx={maxRadius + 2} cy={maxRadius * 2 + 2 - r} r={r}
                                    fill={`rgb(${color.join(',')})`}
                                    stroke="rgb(45,45,60)" strokeWidth="1"
                                />
                            </svg>
                            <span style={{ fontSize: '10px', marginTop: '4px' }}>{formatInt(population)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CityCirclesLegend;
