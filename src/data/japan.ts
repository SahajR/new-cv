import photographs from './japan-photos.json';
import { japanMapPoint, japanDetailBounds, type JapanMapArea } from './japan-map-projection';

const clusterSpecs = [
  { id: 'kansai', name: 'Kansai · Osaka, Kyoto & Kōyasan', symbol: 'castle', anchor: [387, 254], zoom: 40 },
  { id: 'hiroshima', name: 'Hiroshima & Miyajima', symbol: 'torii', anchor: [267, 249], zoom: 40 },
  { id: 'kamakura', name: 'Kamakura & Enoshima', symbol: 'buddha', anchor: [584, 248], zoom: 150 },
  { id: 'fuji', name: 'Around Mount Fuji', symbol: 'fuji-lake', anchor: [548, 240], zoom: 120 },
] as const;

export const japanClusters = clusterSpecs.map(cluster => ({
  ...cluster,
  detail: { src: `/images/travel/japan-map/${cluster.id}-detail.svg`, bounds: japanDetailBounds(cluster.id) },
}));

// Individual cutouts use the cover photograph's GPS. Only the tiny overview
// dots are separated for readability; the regional views have no offsets.
const at = (cluster: JapanMapArea, latitude: number, longitude: number, overviewDot: readonly [number, number]) => {
  const point = japanMapPoint(cluster, latitude, longitude);
  return { cluster, anchor: point, marker: point, overviewDot };
};
export const japanStops = [
  { id: 'osaka', name: 'Osaka', symbol: 'castle', ...at('kansai', 34.6868694444444, 135.526169444444, [379, 260]) },
  { id: 'koyasan', name: 'Kōyasan', symbol: 'temple', ...at('kansai', 34.2189472222222, 135.605730555556, [393, 277]) },
  { id: 'expo-park', name: 'Expo Park', symbol: 'sun', ...at('kansai', 34.8088472222222, 135.532894444444, [373, 245]) },
  { id: 'expo-2025', name: 'Expo 2025', symbol: 'myaku-myaku', ...at('kansai', 34.64985, 135.388008333333, [365, 263]) },
  { id: 'hiroshima', name: 'Hiroshima', symbol: 'dome', ...at('hiroshima', 34.3957083333333, 132.454080555556, [278, 252]) },
  { id: 'miyajima', name: 'Miyajima', symbol: 'torii', ...at('hiroshima', 34.2971138888889, 132.319113888889, [257, 256]) },
  { id: 'kyoto', name: 'Kyoto', symbol: 'pagoda', ...at('kansai', 34.9985472222222, 135.778986111111, [405, 247]) },
  { id: 'tokyo', name: 'Tokyo', symbol: 'tower', marker: [619, 232], anchor: [592, 239] },
  { id: 'kamakura', name: 'Kamakura', region: 'Kamakura & Enoshima', symbol: 'buddha', ...at('kamakura', 35.3166638888889, 139.5357, [596, 250]) },
  { id: 'kamakurakokomae', name: 'Kamakurakōkōmae station', mapLabel: 'Seaside rail', region: 'Kamakura & Enoshima', symbol: 'seaside-station', ...at('kamakura', 35.3067472222222, 139.501516666667, [583, 258]) },
  { id: 'enoshima', name: 'Enoshima', region: 'Kamakura & Enoshima', symbol: 'island-shrine', ...at('kamakura', 35.3002944444444, 139.479738888889, [574, 253]) },
  { id: 'lake-kawaguchiko', name: 'Lake Kawaguchiko', mapLabel: 'Kawaguchiko', region: 'Around Mount Fuji', symbol: 'fuji-lake', ...at('fuji', 35.5230166666667, 138.745902777778, [533, 245]) },
  { id: 'fuji-lawson', name: 'Lawson & Mount Fuji', mapLabel: 'Fuji Lawson', region: 'Around Mount Fuji', symbol: 'fuji-shop', ...at('fuji', 35.4987444444444, 138.756419444444, [545, 252]) },
  { id: 'oshino-hakkai', name: 'Oshino Hakkai', region: 'Around Mount Fuji', symbol: 'pond-village', ...at('fuji', 35.4598666666667, 138.832591666667, [561, 250]) },
  { id: 'chureito-pagoda', name: 'Chureito Pagoda', mapLabel: 'Chureito', region: 'Around Mount Fuji', symbol: 'fuji-pagoda', ...at('fuji', 35.5013527777778, 138.801297222222, [565, 235]) },
] as const;

export const japanPhotos = photographs;
