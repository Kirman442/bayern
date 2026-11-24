import { DENSITY_COLOR_SCALE } from '../map/scales';
import { formatInt } from '../map/format';

const WIDTH = 200;
const BAR_HEIGHT = 10;

// Classes of the density scale used for the Landkreise and kreisfreie Städte.
const ColorLegend = () => {
    const thresholds = DENSITY_COLOR_SCALE.domain();
    const colors = DENSITY_COLOR_SCALE.range();
    const segment = WIDTH / colors.length;

    return (
        <div style={{ width: WIDTH }}>
            <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                Bevölkerungsdichte, Einw./km²
            </div>
            <svg width={WIDTH} height={BAR_HEIGHT + 18} style={{ overflow: 'visible' }}>
                {colors.map((color, i) => (
                    <rect
                        key={i}
                        x={i * segment}
                        y={0}
                        width={segment}
                        height={BAR_HEIGHT}
                        fill={`rgb(${color.slice(0, 3).join(',')})`}
                    />
                ))}
                {thresholds.map((value, i) => (
                    <text
                        key={value}
                        x={(i + 1) * segment}
                        y={BAR_HEIGHT + 13}
                        textAnchor="middle"
                        style={{ fontSize: '10px' }}
                    >
                        {formatInt(value)}
                    </text>
                ))}
            </svg>
        </div>
    );
};

export default ColorLegend;
