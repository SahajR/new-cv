import photographs from './egypt-photos.json';

export const egyptStops = [
  { id: 'karnak', name: 'Karnak', region: 'Luxor', symbol: 'columns', marker: [559, 196], anchor: [546.1, 203.6] },
  { id: 'luxor-temple', name: 'Luxor Temple', region: 'Luxor', symbol: 'pylon', marker: [559, 230], anchor: [545.7, 204.1] },
  { id: 'tutankhamun-tomb', name: 'Tutankhamun’s tomb', mapLabel: 'Tutankhamun', region: 'Luxor', symbol: 'tomb', marker: [526, 196], anchor: [544.8, 203] },
  { id: 'hatshepsut-temple', name: 'Hatshepsut’s temple', mapLabel: 'Hatshepsut', region: 'Luxor', symbol: 'terraces', marker: [526, 230], anchor: [545, 203.1] },
  { id: 'giza-plateau', name: 'Giza plateau', region: 'Cairo & Giza', symbol: 'pyramids', marker: [474, 80], anchor: [511.1, 88.7] },
  { id: 'great-pyramid', name: 'Great Pyramid', region: 'Cairo & Giza', symbol: 'pyramid-interior', marker: [490, 114], anchor: [511.1, 88.5] },
  { id: 'great-sphinx', name: 'Great Sphinx', region: 'Cairo & Giza', symbol: 'sphinx', marker: [523, 114], anchor: [511.2, 88.7] },
  { id: 'coptic-cairo', name: 'Coptic Cairo', region: 'Cairo & Giza', symbol: 'church', marker: [540, 80], anchor: [513.3, 87.8] },
  { id: 'grand-egyptian-museum', name: 'Grand Egyptian Museum', mapLabel: 'Grand Museum', region: 'Cairo & Giza', symbol: 'museum', marker: [507, 80], anchor: [510.7, 88.2] },
] as const;

export const egyptPhotos = photographs;
