import { japanStops, japanPhotos } from './japan';
import { jordanStops, jordanPhotos } from './jordan';
import { egyptStops, egyptPhotos } from './egypt';
import { chinaStops, chinaPhotos } from './china';

export const journalCountries = ['jordan', 'japan', 'egypt', 'china'] as const;
export type JournalCountry = typeof journalCountries[number];
export interface TravelStop {
  readonly id: string;
  readonly name: string;
  readonly mapLabel?: string;
  readonly region?: string;
  readonly symbol: string;
  readonly marker: readonly [number, number];
  readonly anchor: readonly [number, number];
}
export interface TravelPhoto { src: string; thumbnail?: string; width: number; height: number; alt: string; capturedAt: string }
export interface TravelJournal {
  name: string;
  stops: readonly TravelStop[];
  photos: Record<string, TravelPhoto[]>;
  dates: string;
  year: string;
  description: string;
  countryView: string;
  journeyView: string;
}
export const travelJournals: Record<JournalCountry, TravelJournal> = {
  japan: { name: 'Japan', stops: japanStops, photos: japanPhotos, dates: '30 May — 7 June', year: '2025', description: 'Places photographed between 30 May and 7 June 2025, including the Kamakura coast and sights around Mount Fuji.', countryView: '40 -10 890 425', journeyView: '75 -5 820 405' },
  jordan: { name: 'Jordan', stops: jordanStops, photos: jordanPhotos, dates: '12 February — 12 March', year: '2023', description: 'Places photographed between 12 February and 12 March 2023.', countryView: '170 0 580 340', journeyView: '185 0 510 330' },
  egypt: { name: 'Egypt', stops: egyptStops, photos: egyptPhotos, dates: '29 — 30 May', year: '2026', description: 'Four sights around Luxor and five around Cairo and Giza, photographed on 29 and 30 May 2026.', countryView: '95 -45 730 395', journeyView: '115 -35 685 370' },
  china: { name: 'China', stops: chinaStops, photos: chinaPhotos, dates: '23 — 30 September', year: '2023', description: 'Places in Beijing, Hangzhou, and Shanghai, photographed between 23 and 30 September 2023.', countryView: '65 -20 880 410', journeyView: '120 -10 810 405' },
};
export const isJournalCountry = (country: string): country is JournalCountry => journalCountries.some(id => id === country);
export const storyHref = (country: JournalCountry, place: string) => `/travel/${country}/${place}/`;
export const cardId = (place: string) => `place-${place}`;
// A visited value is a calendar date, not a UTC instant.
export function formatVisitDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}
