// Selection state of the map: only ids live here, the objects are looked up from the data.
// Selecting a level always clears everything below it, so the map and the panel can't
// show a district or city that belongs to another selection.

export const initialSelection = {
    regionId: null,   // Bezirk, e.g. '091'
    districtId: null, // Landkreis or kreisfreie Stadt, e.g. '09171'
    cityKey: null,    // Gemeinde, `${land-id}-${id}`
};

export const cityKey = (city) => `${city.properties['land-id']}-${city.properties.id}`;

export function selectionReducer(state, action) {
    switch (action.type) {
        case 'selectRegion':
            return { ...initialSelection, regionId: action.id };
        case 'selectDistrict':
            return { ...state, districtId: action.id, cityKey: null };
        case 'selectCity':
            // The key starts with the Gemeinde's Landkreis, which becomes the selected district
            // (a Gemeinde can be clicked on the map while a kreisfreie Stadt is selected).
            return { ...state, districtId: action.key.split('-')[0], cityKey: action.key };
        case 'back':
            // One level up: Gemeinde → Landkreis → Bezirk → whole Bavaria.
            if (state.cityKey) return { ...state, cityKey: null };
            if (state.districtId) return { ...state, districtId: null };
            return initialSelection;
        case 'reset':
            return initialSelection;
        default:
            throw new Error(`Unknown selection action: ${action.type}`);
    }
}

// The selection is mirrored in the URL hash (#bezirk=091&kreis=09171&gemeinde=…),
// so a view can be shared or bookmarked.
const HASH_KEYS = { regionId: 'bezirk', districtId: 'kreis', cityKey: 'gemeinde' };

export function selectionFromHash(hash) {
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const regionId = params.get(HASH_KEYS.regionId);
    if (!regionId) return initialSelection;
    const districtId = params.get(HASH_KEYS.districtId);
    const key = params.get(HASH_KEYS.cityKey);
    return {
        regionId,
        districtId: districtId || null,
        cityKey: key || null,
    };
}

export function selectionToHash(selection) {
    const params = new URLSearchParams();
    for (const [field, name] of Object.entries(HASH_KEYS)) {
        if (selection[field]) params.set(name, selection[field]);
    }
    const s = params.toString();
    return s ? `#${s}` : '';
}
