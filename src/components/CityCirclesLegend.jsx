import React from 'react';
import { scaleLinear } from 'd3-scale';

const POINT_SIZE_SCALE_LEGEND = scaleLinear()
    .domain([1000, 50000])
    .range([4, 16]);

const POINT_COLOR_SCALE_LEGEND = scaleLinear()
    .domain([1000, 40000])
    .range([[255, 255, 255], [200, 0, 0]]);

const CityCirclesLegend = () => {
    // Генерируем 5 значений населения, равномерно распределенных в домене шкалы размера
    const domain = POINT_SIZE_SCALE_LEGEND.domain();
    const populationValues = [
        domain[1], // Максимальное значение
        domain[1] * 0.75,
        domain[1] * 0.5,
        domain[1] * 0.25,
        domain[0]  // Минимальное значение
    ];

    return (
        <div style={{ width: '250px', margin: '10px' }}> {/* Контейнер для легенды */}
            <div style={{ fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}> {/* Увеличили marginBottom для заголовка */}
                Größe der Städte nach Einwohnerzahl
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', width: '100%', maxWidth: '250px' }}> {/* Контейнер для кругов */}
                {populationValues.map((population, index) => {
                    const radius = POINT_SIZE_SCALE_LEGEND(population);
                    const color = POINT_COLOR_SCALE_LEGEND(population);
                    return (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <svg width={radius * 2 + 8} height={radius * 2 + 8}>
                                <circle
                                    cx={radius + 4} cy={radius + 4} r={radius}
                                    fill={`rgb(${color.join(',')})`}
                                    stroke="#888" strokeWidth="0.5"
                                />
                            </svg>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CityCirclesLegend;
