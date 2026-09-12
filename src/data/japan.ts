import photographs from './japan-photos.json';

export const japanStops = [
  { id: 'osaka', name: 'Osaka', symbol: 'castle', marker: [370, 208], anchor: [397, 230] },
  { id: 'koyasan', name: 'Kōyasan', symbol: 'temple', marker: [475, 284], anchor: [400, 237] },
  { id: 'expo-park', name: 'Expo Park', symbol: 'sun', marker: [360, 93], anchor: [397, 227] },
  { id: 'hiroshima', name: 'Hiroshima', symbol: 'dome', marker: [163, 162], anchor: [259, 235] },
  { id: 'miyajima', name: 'Miyajima', symbol: 'torii', marker: [244, 279], anchor: [254, 237] },
  { id: 'kyoto', name: 'Kyoto', symbol: 'pagoda', marker: [496, 157], anchor: [408, 224] },
  { id: 'tokyo', name: 'Tokyo', symbol: 'tower', marker: [671, 154], anchor: [588, 212] },
  { id: 'kamakura', name: 'Kamakura', symbol: 'buddha', marker: [657, 280], anchor: [576, 219] },
] as const;

export type JapanStopId = typeof japanStops[number]['id'];
export const japanPhotos = photographs;
export const japanStoryHref = (id: string) => `/travel/japan/${id}/`;
export const japanCardId = (id: string) => `place-${id}`;
export function formatVisitDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Tokyo' }).format(new Date(`${date}T12:00:00+09:00`));
}
