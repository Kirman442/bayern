// Selection state of the map: only ids live here, the objects are looked up from the data.
// Selecting a level always clears everything below it, so the map and the panel can't
// show a district or city that belongs to another selection.

export const initialSelection = {
    regionId: null,   // Bezirk, e.g. '091'
    districtId: null, // Landkreis or kreisfreie Stadt, e.g. '09171'
    cityKey: null,    // Gemeinde, `${land-id}-${id}`
    tab: 'regions',   // 'regions' | 'districts'
};

export const cityKey = (city) => `${city.properties['land-id']}-${city.properties.id}`;

export function selectionReducer(state, action) {
    switch (action.type) {
        case 'selectRegion':
            return { ...initialSelection, regionId: action.id };
        case 'selectDistrict':
            return { ...state, districtId: action.id, cityKey: null };
        case 'selectCity':
            return { ...state, cityKey: action.key };
        case 'setTab':
            return state.regionId ? { ...state, tab: action.tab } : state;
        case 'reset':
            return initialSelection;
        default:
            throw new Error(`Unknown selection action: ${action.type}`);
    }
}
