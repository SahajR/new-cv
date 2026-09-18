// Original closing lines, kept here so each country's ending is easy to edit.
export const travelEndings = {
  jordan: {
    image: '/images/travel/endings/jordan.webp',
    alt: 'A small painted scene of Petra’s Treasury, rose-red canyon walls, and two visitors below.',
    quote: 'Twenty-five kilometres, and still looking up.',
  },
  japan: {
    image: '/images/travel/endings/japan.webp',
    alt: 'A hand-painted Mount Fuji framed through a red torii and hanging rope at Arakura Fuji Sengen Shrine.',
    quote: 'One last look through the gate.',
  },
  egypt: {
    image: '/images/travel/endings/egypt.webp',
    alt: 'A traveler seated on a stone ledge with the pyramids behind him, in a few soft painted shapes.',
    quote: 'For once, there was no reason to hurry.',
  },
  india: {
    image: '/images/travel/endings/india.webp',
    alt: 'The Taj Mahal and a small garden beneath a few painted cloud strokes.',
    quote: 'Some places are worth taking the long way home.',
  },
  china: {
    image: '/images/travel/endings/china.webp',
    alt: 'A painted canal boat, arched bridge, and waterside houses in Zhujiajiao.',
    quote: 'Let the water take the long way.',
  },
} as const;

export type TravelEndingCountry = keyof typeof travelEndings;
