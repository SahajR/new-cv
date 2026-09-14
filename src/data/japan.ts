import photographs from './japan-photos.json';

export const japanStops = [
  { id: 'osaka', name: 'Osaka', symbol: 'castle', marker: [320, 210], anchor: [397, 230] },
  { id: 'koyasan', name: 'Kōyasan', symbol: 'temple', marker: [320, 350], anchor: [400, 237] },
  { id: 'expo-park', name: 'Expo Park', symbol: 'sun', marker: [305, 75], anchor: [397, 227] },
  { id: 'hiroshima', name: 'Hiroshima', symbol: 'dome', marker: [140, 85], anchor: [259, 235] },
  { id: 'miyajima', name: 'Miyajima', symbol: 'torii', marker: [155, 340], anchor: [254, 237] },
  { id: 'kyoto', name: 'Kyoto', symbol: 'pagoda', marker: [480, 210], anchor: [408, 224] },
  { id: 'tokyo', name: 'Tokyo', symbol: 'tower', marker: [800, 75], anchor: [588, 212] },
  { id: 'kamakura', name: 'Kamakura', region: 'Kamakura & Enoshima', symbol: 'buddha', marker: [480, 350], anchor: [576, 219] },
  { id: 'kamakurakokomae', name: 'Kamakurakōkōmae station', mapLabel: 'Seaside rail', region: 'Kamakura & Enoshima', symbol: 'seaside-station', marker: [645, 350], anchor: [574.7, 219.3] },
  { id: 'enoshima', name: 'Enoshima', region: 'Kamakura & Enoshima', symbol: 'island-shrine', marker: [810, 355], anchor: [573.7, 219.4] },
  { id: 'lake-kawaguchiko', name: 'Lake Kawaguchiko', mapLabel: 'Kawaguchiko', region: 'Around Mount Fuji', symbol: 'fuji-lake', marker: [470, 65], anchor: [540.8, 215.5] },
  { id: 'fuji-lawson', name: 'Lawson & Mount Fuji', mapLabel: 'Fuji Lawson', region: 'Around Mount Fuji', symbol: 'fuji-shop', marker: [645, 210], anchor: [541.3, 215.9] },
  { id: 'oshino-hakkai', name: 'Oshino Hakkai', region: 'Around Mount Fuji', symbol: 'pond-village', marker: [810, 215], anchor: [544.7, 216.6] },
  { id: 'chureito-pagoda', name: 'Chureito Pagoda', mapLabel: 'Chureito', region: 'Around Mount Fuji', symbol: 'fuji-pagoda', marker: [635, 65], anchor: [543.3, 215.9] },
] as const;

export const japanPhotos = photographs;
