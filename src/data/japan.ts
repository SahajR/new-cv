import photographs from './japan-photos.json';

// Small markers sit near the illustrated locations; crowded regions use modest offsets.
export const japanStops = [
  { id: 'osaka', name: 'Osaka', symbol: 'castle', marker: [370, 265], anchor: [387, 254] },
  { id: 'koyasan', name: 'Kōyasan', symbol: 'temple', marker: [402, 299], anchor: [393, 271] },
  { id: 'expo-park', name: 'Expo Park', symbol: 'sun', marker: [378, 221], anchor: [390, 249] },
  { id: 'hiroshima', name: 'Hiroshima', symbol: 'dome', marker: [273, 241], anchor: [267, 249] },
  { id: 'miyajima', name: 'Miyajima', symbol: 'torii', marker: [250, 279], anchor: [262, 253] },
  { id: 'kyoto', name: 'Kyoto', symbol: 'pagoda', marker: [418, 245], anchor: [400, 246] },
  { id: 'tokyo', name: 'Tokyo', symbol: 'tower', marker: [619, 232], anchor: [592, 239] },
  { id: 'kamakura', name: 'Kamakura', region: 'Kamakura & Enoshima', symbol: 'buddha', marker: [614, 282], anchor: [584, 248] },
  { id: 'kamakurakokomae', name: 'Kamakurakōkōmae station', mapLabel: 'Seaside rail', region: 'Kamakura & Enoshima', symbol: 'seaside-station', marker: [572, 302], anchor: [582.7, 248.3] },
  { id: 'enoshima', name: 'Enoshima', region: 'Kamakura & Enoshima', symbol: 'island-shrine', marker: [530, 300], anchor: [581.7, 248.4] },
  { id: 'lake-kawaguchiko', name: 'Lake Kawaguchiko', mapLabel: 'Kawaguchiko', region: 'Around Mount Fuji', symbol: 'fuji-lake', marker: [531, 213], anchor: [548, 240] },
  { id: 'fuji-lawson', name: 'Lawson & Mount Fuji', mapLabel: 'Fuji Lawson', region: 'Around Mount Fuji', symbol: 'fuji-shop', marker: [530, 255], anchor: [548.5, 240.4] },
  { id: 'oshino-hakkai', name: 'Oshino Hakkai', region: 'Around Mount Fuji', symbol: 'pond-village', marker: [572, 257], anchor: [551.9, 241.1] },
  { id: 'chureito-pagoda', name: 'Chureito Pagoda', mapLabel: 'Chureito', region: 'Around Mount Fuji', symbol: 'fuji-pagoda', marker: [574, 214], anchor: [550.5, 240.4] },
] as const;

export const japanPhotos = photographs;
