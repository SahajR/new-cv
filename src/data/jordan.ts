import photographs from './jordan-photos.json';

export const jordanStops = [
  { id: 'amman', name: 'Amman', symbol: 'citadel', marker: [544, 98], anchor: [432, 124] },
  { id: 'petra', name: 'Petra', symbol: 'treasury', marker: [516, 202], anchor: [396, 232] },
  { id: 'wadi-rum', name: 'Wadi Rum', symbol: 'camp', marker: [558, 288], anchor: [400, 276] },
  { id: 'aqaba', name: 'Aqaba', symbol: 'waterfront', marker: [270, 272], anchor: [368, 284] },
  { id: 'dead-sea', name: 'Dead Sea', symbol: 'sea', marker: [272, 142], anchor: [408, 140] },
] as const;

export const jordanPhotos = photographs;
