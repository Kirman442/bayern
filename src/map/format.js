// German number formatting for all numbers shown in the panel and tooltips.
import { urbanClass } from './scales';
const integer = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatInt = (n) => integer.format(n);
export const formatPeople = (n) => `${integer.format(n)} Einw.`;
export const formatArea = (km2) => `${oneDecimal.format(km2)} km²`;
export const formatDensity = (props) => `${oneDecimal.format(props.population / props.area)} Einw./km²`;

// "ländlich (gering besiedelt)" for a Grad-der-Verstädterung class.
// short: just "ländlich", for the compact stat grid.
export const formatUrban = (value, short = false) => {
    const c = urbanClass(value);
    if (!c) return '–';
    return short ? c.short : `${c.short} (${c.label})`;
};

const percent = new Intl.NumberFormat('de-DE', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const formatPercent = (share) => percent.format(share);
