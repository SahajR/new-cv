import photographs from './china-photos.json';

export const chinaStops = [
  { id: 'forbidden-city', name: 'Forbidden City & Jingshan', mapLabel: 'Forbidden City', region: 'Beijing', symbol: 'palace', marker: [535, 62], anchor: [470.3, 195.6] },
  { id: 'mutianyu-great-wall', name: 'Mutianyu Great Wall', mapLabel: 'Great Wall', region: 'Beijing', symbol: 'wall', marker: [365, 52], anchor: [472, 191.8] },
  { id: 'birds-nest', name: 'Bird’s Nest', region: 'Beijing', symbol: 'stadium', marker: [715, 62], anchor: [470.3, 195.1] },
  { id: 'hangzhou-olympic-sports-centre', name: 'Olympic Sports Centre', mapLabel: 'Little Lotus', region: 'Hangzhou', symbol: 'lotus', marker: [200, 330], anchor: [502.9, 268.3] },
  { id: 'west-lake', name: 'West Lake', region: 'Hangzhou', symbol: 'pavilion', marker: [370, 325], anchor: [502.3, 268.1] },
  { id: 'shanghai-waterfront', name: 'The Bund & Lujiazui', mapLabel: 'The Bund', region: 'Shanghai', symbol: 'skyline', marker: [688, 200], anchor: [514, 260.7] },
  { id: 'shanghai-zoo', name: 'Shanghai Zoo', region: 'Shanghai', symbol: 'tortoise', marker: [534, 330], anchor: [512.6, 261.1] },
  { id: 'yuyuan', name: 'Yuyuan Garden & Bazaar', mapLabel: 'Yuyuan', region: 'Shanghai', symbol: 'bazaar', marker: [694, 340], anchor: [514.1, 260.8] },
  { id: 'shanghai-disneyland', name: 'Shanghai Disneyland', mapLabel: 'Disneyland', region: 'Shanghai', symbol: 'castle', marker: [856, 195], anchor: [515.6, 261.4] },
  { id: 'shanghai-maglev', name: 'Shanghai Maglev', mapLabel: 'Maglev', region: 'Shanghai', symbol: 'train', marker: [864, 340], anchor: [514.2, 261] },
  { id: 'zhujiajiao', name: 'Zhujiajiao', region: 'Shanghai', symbol: 'canal', marker: [185, 178], anchor: [510.98, 261.68] },
] as const;

export const chinaPhotos = photographs;
