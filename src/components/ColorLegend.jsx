import { Fragment } from 'react';

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
            <svg width={legendWidth} height={legendHeight + 20}>
                {range.map((color, index) => { // Перебираем цвета из цветовой шкалы
                    const xStart = index * segmentWidth; // Начало X-координаты для сегмента
                    const labelText = index === 0 ? `< ${domain[0]}` : `${domain[index]}`;

                    return (
                        <Fragment key={index}> {/* Fragment чтобы не создавать лишний DOM-элемент */}
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
                        </Fragment>
                    );
                })}
                <text
                    x={legendWidth} // X координата - в конце легенды
                    y={legendHeight + 15}
                    textAnchor="end" // Выравнивание текста по правому краю
                    style={{ fontSize: '10px' }}
                >
                    {/* ≥ {domain[domain.length - 1]} */}
                </text>
            </svg>
        </div>
    );
};

export default ColorLegend;