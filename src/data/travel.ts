export interface TravelCountry {
  slug: string;
  name: string;
  code: string;
  page: number;
  image: string;
  imageAlt: string;
  caption: string;
  places: string;
  note: string;
  memories: string[];
}

// A position is an open country spread. One physical leaf turn advances one
// position; the cover is position 0. Keep these numbers stable as stories grow.
export const travelCountries: TravelCountry[] = [
  {
    slug: 'jordan', name: 'Jordan', code: 'JO', page: 1,
    image: '/images/travel/petra.png',
    imageAlt: 'Pixel art of Al-Khazneh, Petra’s Treasury, framed by rose-red canyon walls.',
    caption: 'The rose-red city', places: 'Petra · Dead Sea',
    note: 'Long walks, ancient stone, and a moment of weightlessness.',
    memories: ['Walked more than 25 km in one day in Petra.', 'Floated in the Dead Sea.'],
  },
  {
    slug: 'japan', name: 'Japan', code: 'JP', page: 2,
    image: '/images/travel/japan.png',
    imageAlt: 'Pixel art of Mount Fuji, a red pagoda and cherry blossoms in Japan.',
    caption: 'A little further by rail', places: 'Five cities · One day',
    note: 'From city to city, all the way to the tracks beside the sea.',
    memories: ['Visited Miyajima, Hiroshima, Kobe, Osaka and Kyoto in one day.', 'Visited the seaside railway crossing near Enoshima.'],
  },
  {
    slug: 'egypt', name: 'Egypt', code: 'EG', page: 3,
    image: '/images/travel/pyramids.png',
    imageAlt: 'Pixel art of the pyramids of Giza with sunlit faces above the desert.',
    caption: 'Across the centuries', places: 'Pyramids · Tutankhamun',
    note: 'A few encounters with a very, very old world.',
    memories: ['Visited the pyramids.', 'Visited Tutankhamun in his tomb.'],
  },
  {
    slug: 'india', name: 'India', code: 'IN', page: 4,
    image: '/images/travel/taj-mahal.png',
    imageAlt: 'Pixel art of the Taj Mahal reflected in its garden pool.',
    caption: 'State by state', places: '8 of 28 states',
    note: 'A growing collection of places, with plenty more still to see.',
    memories: ['Visited 8 of India’s 28 states. More photographs and notes to come.'],
  },
  {
    slug: 'china', name: 'China', code: 'CN', page: 5,
    image: '/images/achievements/one-offs/disneyland.png',
    imageAlt: 'Pixel art of a fairytale castle with blue turrets and fireworks.',
    caption: 'A little make-believe', places: 'Shanghai Disneyland',
    note: 'A page for Shanghai, and a castle along the way.',
    memories: ['Visited Shanghai Disneyland. More photographs and notes to come.'],
  },
];

export const countryHref = (country: TravelCountry) => `/travel/${country.slug}/`;
export const countryFromPath = (path: string) => travelCountries.find((country) =>
  path.replace(/\/$/, '') === `/travel/${country.slug}`,
);

export const BOOK_VISIT_KEY = 'hey.sr:travel-book:v1';
export const BOOK_HANDOFF_KEY = 'hey.sr:travel-handoff:v1';
