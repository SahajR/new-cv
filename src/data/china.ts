import photographs from './china-photos.json';

// Keep the city detail in the same projection as the painted country outline.
export const chinaMapPoint = (latitude: number, longitude: number): readonly [number, number] =>
  [110 + (longitude - 74) * 8.5, 360 - (latitude - 18) * 7.5];

export const chinaClusters = [{
  id: 'shanghai', name: 'Shanghai', symbol: 'skyline',
  anchor: chinaMapPoint(31.2375, 121.486), zoom: 1100,
  detail: { src: '/images/travel/china-map/shanghai-detail.svg', bounds: [510, 258, 7, 5] },
}] as const;

// Shanghai uses photo GPS for the visited sights; Zhujiajiao uses the confirmed town center.
// Overview dots are gently separated; detailed icons retain their geographic coordinates.
export const chinaStops = [
  { id: 'forbidden-city', name: 'Forbidden City & Jingshan', mapLabel: 'Forbidden City', region: 'Beijing', symbol: 'palace', marker: [470, 216], anchor: [470.3, 195.6] },
  { id: 'mutianyu-great-wall', name: 'Mutianyu Great Wall', mapLabel: 'Great Wall', region: 'Beijing', symbol: 'wall', marker: [452, 184], anchor: [472, 191.8] },
  { id: 'birds-nest', name: 'Bird’s Nest', region: 'Beijing', symbol: 'stadium', marker: [486, 184], anchor: [470.3, 195.1] },
  { id: 'hangzhou-olympic-sports-centre', name: 'Olympic Sports Centre', mapLabel: 'Little Lotus', region: 'Hangzhou', symbol: 'lotus', marker: [492, 309], anchor: [502.9, 268.3] },
  { id: 'west-lake', name: 'West Lake', region: 'Hangzhou', symbol: 'pavilion', marker: [475, 279], anchor: [502.3, 268.1] },
  { id: 'shanghai-waterfront', name: 'The Bund & Lujiazui', mapLabel: 'The Bund', region: 'Shanghai', symbol: 'skyline', cluster: 'shanghai', overviewDot: [520, 258], marker: chinaMapPoint(31.237497, 121.486047), anchor: chinaMapPoint(31.237497, 121.486047) },
  { id: 'shanghai-zoo', name: 'Shanghai Zoo', region: 'Shanghai', symbol: 'tortoise', cluster: 'shanghai', overviewDot: [505, 263], marker: chinaMapPoint(31.193583, 121.363831), anchor: chinaMapPoint(31.193583, 121.363831) },
  { id: 'yuyuan', name: 'Yuyuan Garden & Bazaar', mapLabel: 'Yuyuan', region: 'Shanghai', symbol: 'bazaar', cluster: 'shanghai', overviewDot: [513, 269], marker: chinaMapPoint(31.228003, 121.487367), anchor: chinaMapPoint(31.228003, 121.487367) },
  { id: 'shanghai-disneyland', name: 'Shanghai Disneyland', mapLabel: 'Disneyland', region: 'Shanghai', symbol: 'castle', cluster: 'shanghai', overviewDot: [525, 274], marker: chinaMapPoint(31.146131, 121.655597), anchor: chinaMapPoint(31.146131, 121.655597) },
  { id: 'shanghai-maglev', name: 'Shanghai Maglev', mapLabel: 'Maglev', region: 'Shanghai', symbol: 'train', cluster: 'shanghai', overviewDot: [523, 265], marker: chinaMapPoint(31.204653, 121.553514), anchor: chinaMapPoint(31.204653, 121.553514) },
  { id: 'zhujiajiao', name: 'Zhujiajiao', region: 'Shanghai', symbol: 'canal', cluster: 'shanghai', overviewDot: [495, 271], marker: chinaMapPoint(31.109333, 121.174118), anchor: chinaMapPoint(31.109333, 121.174118) },
] as const;

export const chinaPhotos = photographs;
