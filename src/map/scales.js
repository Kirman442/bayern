// Scales shared by the map layers and the legends, so both always show the same thing.
import { scaleLog, scaleSqrt, scaleThreshold } from 'd3-scale';

export const density = (feature) => feature.properties.population / feature.properties.area;

// Landkreise and kreisfreie Städte are coloured by population density (Einw./km²),
// the same measure that sets their height. Palette: ColorBrewer YlGnBu, 7 classes.
export const DENSITY_COLOR_SCALE = scaleThreshold()
    .domain([100, 150, 200, 300, 500, 1500])
    .range([
        [255, 255, 204, 255],
        [199, 233, 180, 255],
        [127, 205, 187, 255],
        [65, 182, 196, 255],
        [29, 145, 192, 255],
        [34, 94, 168, 255],
        [12, 44, 132, 255],
    ]);

// Gemeinden: circle area is proportional to population (radius in pixels, so the legend
// matches at every zoom), colour on a log scale from white to dark red.
export const CITY_POPULATION_EXTENT = [2000, 60000];

export const CITY_RADIUS_SCALE = scaleSqrt()
    .domain([0, CITY_POPULATION_EXTENT[1]])
    .range([0, 11])
    .clamp(true);

export const CITY_COLOR_SCALE = scaleLog()
    .domain(CITY_POPULATION_EXTENT)
    .range([[255, 255, 255], [165, 0, 38]])
    .clamp(true);

export const CITY_LEGEND_VALUES = [1000, 5000, 20000, 60000];
