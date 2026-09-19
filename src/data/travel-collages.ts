import type { JournalCountry } from './travel-journals';

interface CollagePhoto {
  place: string;
  photo?: number;
  position?: string;
}

// Four photographs per country (UAE shares its temporary placeholder). Indices refer to the existing photo
// collections; position keeps the subject visible in the square print crop.
export const travelCollages: Record<JournalCountry, readonly CollagePhoto[]> = {
  uae: [{ place: 'ferrari-world' }, { place: 'burj-khalifa' }, { place: 'desert-bike' }, { place: 'dibba-rock' }],
  jordan: [
    { place: 'petra' },
    { place: 'wadi-rum' },
    { place: 'amman' },
    { place: 'dead-sea' },
  ],
  japan: [
    { place: 'chureito-pagoda', position: '65% 50%' },
    { place: 'miyajima' },
    { place: 'kyoto', position: '50% 35%' },
    { place: 'kamakurakokomae', position: '80% 50%' },
  ],
  egypt: [
    { place: 'giza-plateau', position: '50% 35%' },
    { place: 'karnak', position: '50% 40%' },
    { place: 'hatshepsut-temple' },
    { place: 'great-sphinx' },
  ],
  india: [
    { place: 'taj-mahal' },
    { place: 'agra-fort' },
    { place: 'rajgad-fort' },
    { place: 'rajgad-fort', photo: 3, position: '50% 70%' },
  ],
  china: [
    { place: 'forbidden-city' },
    { place: 'mutianyu-great-wall', position: '50% 35%' },
    { place: 'shanghai-waterfront' },
    { place: 'yuyuan', position: '50% 35%' },
  ],
};
