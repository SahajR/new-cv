import photographs from './india-photos.json';
import { indiaMapPoint } from './india-map-projection';

const taj = indiaMapPoint(27.173775, 78.0421166666667);
const fort = indiaMapPoint(27.1766555555556, 78.022175);
const rajgad = indiaMapPoint(18.2483416666667, 73.6813055555556);

export const indiaClusters = [{
  id: 'agra', name: 'Agra', symbol: 'taj', anchor: taj, zoom: 600,
  detail: { src: '/images/travel/india-map/agra-detail.svg', bounds: [128.4, 124.1, 1.5, 1.7] },
}] as const;

// Use the imported photos' GPS in the native projection of the country map.
// Only the overview dots are spaced out; the expanded Agra sights are exact.
export const indiaStops = [
  { id: 'taj-mahal', name: 'Taj Mahal', symbol: 'taj', region: 'Agra', cluster: 'agra', overviewDot: [140, 129], marker: taj, anchor: taj },
  { id: 'agra-fort', name: 'Agra Fort', symbol: 'fort', region: 'Agra', cluster: 'agra', overviewDot: [118, 129], marker: fort, anchor: fort },
  { id: 'rajgad-fort', name: 'Rajgad Fort', symbol: 'hill-fort', region: 'Maharashtra', marker: rajgad, anchor: rajgad },
] as const;

export const indiaPhotos = photographs;
