import photographs from './india-photos.json';

export const indiaStops = [
  { id: 'taj-mahal', name: 'Taj Mahal', symbol: 'taj', region: 'Agra', marker: [690, 118], anchor: [440.4, 116.2] },
  { id: 'agra-fort', name: 'Agra Fort', symbol: 'fort', region: 'Agra', marker: [255, 160], anchor: [440.2, 116.1] },
  { id: 'rajgad-fort', name: 'Rajgad Fort', symbol: 'hill-fort', region: 'Maharashtra', marker: [280, 295], anchor: [396.9, 209.9] },
] as const;

export const indiaPhotos = photographs;
