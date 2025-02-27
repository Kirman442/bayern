// ColorLegend.jsx
import React from 'react';
// import * as d3 from 'd3';

const ColorLegend = ({ colorScale }) => {
    const domain = colorScale.domain(); // Получаем домены (пороговые значения) из цветовой шкалы
    const range = colorScale.range();   // Получаем цвета из цветовой шкалы
    const legendHeight = 10;           // Высота линии легенды
    const legendWidth = 250;            // Ширина легенды (можно настроить)
    const segmentWidth = legendWidth / range.length; // Ширина сегмента цветовой линии

    return (
        <div style={{ width: legendWidth, margin: '10px' }}> {/* Контейнер для легенды */}
            <div style={{ fontSize: '12px', textAlign: 'center', marginBottom: '10px' }}>
                Fläche der Landkreise, km² {/* Заголовок легенды - можно изменить */}
            </div>
            <svg width={legendWidth} height={legendHeight + 20}> {/* SVG для рисования легенды (высота увеличена под текст) */}
                {range.map((color, index) => { // Перебираем цвета из цветовой шкалы
                    const xStart = index * segmentWidth; // Начало X-координаты для сегмента
                    const xEnd = (index + 1) * segmentWidth; // Конец X-координаты для сегмента
                    const thresholdValue = domain[index]; // Пороговое значение для этого сегмента
                    // Текст подписи для сегмента (например, "< 500", "500 - 1000" и т.д.)
                    const labelText = index === 0 ? `< ${domain[0]}` : `${domain[index]}`;

                    return (
                        <React.Fragment key={index}> {/* React.Fragment чтобы не создавать лишний DOM-элемент */}
                            <rect // Рисуем цветной прямоугольник (сегмент легенды)
                                x={xStart}
                                y={0}
                                width={segmentWidth}
                                height={legendHeight}
                                fill={`rgba(${color.join(',')})`} // Заполняем цветом из палитры
                            />
                            <text // Добавляем текстовую подпись под сегментом
                                x={xStart + segmentWidth / 2} // Центрируем текст по горизонтали
                                y={legendHeight + 15}        // Позиционируем текст ниже линии
                                textAnchor="middle"           // Выравнивание текста по центру
                                style={{ fontSize: '10px' }}   // Размер шрифта (можно настроить)
                            >
                                {labelText}
                            </text>
                        </React.Fragment>
                    );
                })}
                {/* Подпись для последнего диапазона (>= максимального значения домена) */}
                <text
                    x={legendWidth} // X координата - в конце легенды
                    y={legendHeight + 15}
                    textAnchor="end" // Выравнивание текста по правому краю
                    style={{ fontSize: '10px' }}
                >
                    {/* ≥ {domain[domain.length - 1]} */}
                </text>
            </svg>
            {/* <div style={{ fontSize: '12px', textAlign: 'center', marginTop: '5px' }}>
                Fläche der Landkreise, km²
            </div> */}
        </div>
    );
};

export default ColorLegend;