export interface Achievement {
  id: string;
  category: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  status: string;
  nextInProgress?: boolean;
  /** Track a measured percentage against a lower goal, rather than completion. */
  measurement?: 'percentage';
  accent: string;
  image: string;
  imageAlt: string;
}

export const achievements: Achievement[] = [
  {
    id: 'wonders', category: 'Travel', title: 'Seven wonders',
    description: 'Travel to all seven wonders of the world.',
    current: 4, target: 7, unit: 'wonders visited',
    status: '5th wonder in progress', nextInProgress: true,
    accent: '#cf8558', image: '/images/achievements/wonders.png',
    imageAlt: 'Pixel art of ancient monuments in a rose-sandstone landscape.',
  },
  {
    id: 'scuba', category: 'Underwater', title: 'Master scuba diver',
    description: 'The 50-dive milestone on the way to master level.',
    current: 35, target: 50, unit: 'dives logged',
    status: '15 more dives to the milestone',
    accent: '#448d87', image: '/images/achievements/scuba.png',
    imageAlt: 'Pixel art of a scuba diver exploring a deep turquoise reef.',
  },
  {
    id: 'skydive', category: 'In the sky', title: 'Ten solo skydives',
    description: 'Take the leap. Skydive solo ten times.',
    current: 4, target: 10, unit: 'solo jumps',
    status: '6 more jumps to go',
    accent: '#738bc5', image: '/images/achievements/skydive.png',
    imageAlt: 'Pixel art of a solo skydiver under an orange parachute above the clouds.',
  },
  {
    id: 'continents', category: 'Exploration', title: 'Every continent',
    description: 'Set foot on all seven continents.',
    current: 2, target: 7, unit: 'continents visited',
    status: '5 continents still to explore',
    accent: '#7b9860', image: '/images/achievements/continents.png',
    imageAlt: 'Pixel art of a terrestrial globe with green continents and blue oceans.',
  },
  {
    id: 'languages', category: 'Learning', title: 'Eight languages',
    description: 'Speak and read in eight languages.',
    current: 5, target: 8, unit: 'languages learned',
    status: '6th language in progress', nextInProgress: true,
    accent: '#b66d8d', image: '/images/achievements/languages.png',
    imageAlt: 'Pixel art of an open book, stacked books and speech bubbles.',
  },
  {
    id: 'india-states', category: 'Travel', title: 'India, state by state',
    description: 'Visit 28 states across India.',
    current: 8, target: 28, unit: 'states visited',
    status: '20 states still to explore',
    accent: '#c68b4f', image: '/images/achievements/india-states.png',
    imageAlt: 'Pixel art of a train winding through Indian hills toward domes and palaces.',
  },
  {
    id: 'us-states', category: 'Travel', title: 'Across the United States',
    description: 'Visit all 50 US states.',
    current: 0, target: 50, unit: 'states visited',
    status: '50 states still to explore',
    accent: '#778ab3', image: '/images/achievements/us-states.png',
    imageAlt: 'Pixel art of an American road trip through red desert mesas toward blue mountains.',
  },
  {
    id: 'body-fat', category: 'Fitness', title: 'Reach 15% body fat',
    description: 'Working toward my body composition goal.',
    current: 23, target: 15, unit: 'body fat', measurement: 'percentage',
    status: '8 percentage points to the goal',
    accent: '#66876d', image: '/images/achievements/body-fat.png',
    imageAlt: 'Pixel art of a scale, measuring tape, kettlebell and towel in a quiet gym.',
  },
];
