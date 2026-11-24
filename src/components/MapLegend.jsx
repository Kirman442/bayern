import { useState } from 'react';
import ColorLegend from './ColorLegend';
import CityCirclesLegend from './CityCirclesLegend';

// Legends live on the map, not in the panel, so they are visible at every level.
// On phones the box starts collapsed to save space.
const MapLegend = ({ showCities }) => {
    const [open, setOpen] = useState(() => window.innerWidth > 640);
    return (
        <div className={`map-legend ${open ? '' : 'collapsed'}`}>
            <button className="map-legend-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
                Legende {open ? '▾' : '▸'}
            </button>
            {open && (
                <>
                    <ColorLegend />
                    {showCities && <CityCirclesLegend />}
                </>
            )}
        </div>
    );
};

export default MapLegend;
