import { uaeMapPoint, uaeDetailBounds } from './uae-map-projection';
import type { TravelPhoto, TravelStop } from './travel-journals';

// Public landmark coordinates; sources and approximate area pins are documented
// in docs/uae-bootstrap.md. Replace placeholder photographs independently below.
export const uaeLocations = [
  { id: 'ferrari-world', name: 'Yas Island — Ferrari World', region: 'Abu Dhabi', cluster: 'abu-dhabi', coordinates: [24.483673, 54.606857] },
  { id: 'sea-world', name: 'SeaWorld Abu Dhabi', region: 'Abu Dhabi', cluster: 'abu-dhabi', coordinates: [24.48560, 54.61928] },
  { id: 'abu-dhabi-mall', name: 'Abu Dhabi Mall', region: 'Abu Dhabi', cluster: 'abu-dhabi', coordinates: [24.4959, 54.3832] },
  { id: 'dalma-mall', name: 'Dalma Mall', region: 'Abu Dhabi', cluster: 'abu-dhabi', coordinates: [24.33306, 54.52382] },
  { id: 'museum-of-the-future', name: 'Museum of the Future', region: 'Dubai', cluster: 'dubai', coordinates: [25.21912, 55.2821] },
  { id: 'burj-khalifa', name: 'Burj Khalifa', region: 'Dubai', cluster: 'dubai', coordinates: [25.1972, 55.2742] },
  { id: 'old-deira', name: 'Old Deira', region: 'Dubai', cluster: 'dubai', coordinates: [25.26714, 55.29799] },
  { id: 'karama', name: 'Karama', region: 'Dubai', cluster: 'dubai', coordinates: [25.24, 55.3011] },
  { id: 'dubai-frame', name: 'Dubai Frame', region: 'Dubai', cluster: 'dubai', coordinates: [25.2355, 55.3004] },
  { id: 'skydive-desert', name: 'Skydive Dubai Desert Campus', region: 'Dubai', cluster: 'dubai', coordinates: [24.88523, 55.54801] },
  { id: 'deep-dive', name: 'Deep Dive Dubai', region: 'Dubai', cluster: 'dubai', coordinates: [25.12768, 55.295127] },
  { id: 'desert-bike', name: 'Desert Bike — Al Marmoom', region: 'Dubai', cluster: 'dubai', coordinates: [24.83, 55.38] },
  { id: 'dibba-rock', name: 'Dibba Rock', region: 'Fujairah', cluster: 'fujairah', coordinates: [25.60343, 56.35024] },
  { id: 'sharm-rock', name: 'Sharm Rock', region: 'Fujairah', cluster: 'fujairah', coordinates: [25.481944, 56.365861] },
] as const;

export const uaeClusters = [
  { id: 'abu-dhabi', name: 'Abu Dhabi', symbol: 'ferrari-world', anchor: uaeMapPoint(24.48, 54.52), zoom: 100, detail: { src: '/images/travel/uae-map/abu-dhabi-detail.svg', bounds: uaeDetailBounds('abu-dhabi') } },
  { id: 'dubai', name: 'Dubai', symbol: 'burj-khalifa', anchor: uaeMapPoint(25.20, 55.28), zoom: 180, detail: { src: '/images/travel/uae-map/dubai-detail.svg', bounds: uaeDetailBounds('dubai') } },
  { id: 'fujairah', name: 'Fujairah', symbol: 'dibba-rock', anchor: uaeMapPoint(25.54, 56.36), zoom: 40, detail: { src: '/images/travel/uae-map/fujairah-detail.svg', bounds: uaeDetailBounds('fujairah') } },
] as const;

export const uaeStops: readonly TravelStop[] = uaeLocations.map(location => {
  const anchor = uaeMapPoint(location.coordinates[0], location.coordinates[1]);
  const cluster = uaeClusters.find(cluster => cluster.id === location.cluster)!;
  const siblings = uaeLocations.filter(stop => stop.cluster === location.cluster);
  const index = siblings.findIndex(stop => stop.id === location.id);
  // Only overview dots are distributed for readability. Expanded markers use
  // geographic positions in exactly the same projection as the detail layer.
  const angle = Math.PI * (.15 + .7 * index / Math.max(1, siblings.length - 1));
  const overviewDot: readonly [number, number] = [cluster.anchor[0] + Math.cos(angle) * 22, cluster.anchor[1] + Math.sin(angle) * 15 + 3];
  return { id: location.id, name: location.name, symbol: location.id, region: location.region, cluster: location.cluster, anchor, marker: anchor, overviewDot };
});

export const uaePlaceholder: TravelPhoto = {
  src: '/images/travel/uae/placeholder.webp',
  thumbnail: '/images/travel/uae/placeholder.webp',
  width: 1200, height: 800,
  alt: 'Temporary generated desert photograph. A photograph from this stop will be added later.',
  placeholder: true,
};

// Swap a stop's array for its real photographs when importing the camera roll.
export const uaePhotos: Record<string, TravelPhoto[]> = Object.fromEntries(
  uaeStops.map(stop => [stop.id, [{ ...uaePlaceholder }]]),
);
