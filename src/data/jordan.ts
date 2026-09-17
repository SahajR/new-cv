import photographs from './jordan-photos.json';

export const jordanStops = [
  { id: 'amman', name: 'Amman', symbol: 'citadel', marker: [436, 124], anchor: [432, 124] },
  { id: 'petra', name: 'Petra', symbol: 'treasury', marker: [402, 235], anchor: [396, 232] },
  { id: 'wadi-rum', name: 'Wadi Rum', symbol: 'camp', marker: [412, 281], anchor: [400, 276] },
  { id: 'aqaba', name: 'Aqaba', symbol: 'waterfront', marker: [368, 298], anchor: [368, 284] },
  { id: 'dead-sea', name: 'Dead Sea', symbol: 'sea', marker: [401, 160], anchor: [408, 140] },
] as const;

export const jordanPhotos = photographs;
