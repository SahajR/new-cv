export type AchievementDetail =
  | { type: 'text'; text: string }
  | { type: 'image'; src: string; alt: string; width?: number; height?: number; caption?: string; pixelArt?: boolean };

export interface OneOffAchievement {
  id: string;
  title: string;
  completed: boolean;
  inProgress?: boolean;
  note?: string;
  imageAlt: string;
  /** Ordered popup content: text, images, or both. */
  details?: AchievementDetail[];
}

export const oneOffAchievements: OneOffAchievement[] = [
  { id: 'whale-shark', title: 'Spot a whale shark and swim with it', completed: false, imageAlt: 'Pixel art of a spotted whale shark swimming beside a tiny swimmer.' },
  { id: 'pyramids', title: 'Visit the eighth wonder: the pyramids', completed: true, imageAlt: 'Pixel art of the pyramids of Giza in a golden desert.' },
  { id: 'volcano-ride', title: 'Ride down a volcano', completed: false, imageAlt: 'Pixel art of a rider descending a volcanic ash slope on a board.' },
  { id: 'volcano-climb', title: 'Climb up a volcano', completed: false, imageAlt: 'Pixel art of a hiker climbing a volcanic ridge toward the summit.' },
  { id: 'reindeer', title: 'Try reindeer meat', completed: false, imageAlt: 'Pixel art of a Nordic meal with cooked reindeer, potatoes and berries.' },
  { id: 'dubai-aquarium', title: 'Scuba dive in Dubai Aquarium', completed: true, imageAlt: 'Pixel art of a scuba diver and marine life behind an aquarium viewing window.' },
  { id: 'iceland', title: 'Travel around Iceland’s contour', completed: false, imageAlt: 'Pixel art of Iceland with a coastal route circling the island.' },
  { id: 'northern-lights', title: 'View the northern lights', completed: true, imageAlt: 'Pixel art of green northern lights over snowy mountains and a lake.' },
  { id: 'hot-spring', title: 'Bathe in a hot spring', completed: false, imageAlt: 'Pixel art of a steaming natural hot spring surrounded by rocks.' },
  { id: 'desert-buggy', title: 'Drive a buggy in the desert', completed: true, imageAlt: 'Pixel art of a dune buggy driving across golden sand dunes.' },
  { id: 'salsa', title: 'Learn salsa', completed: false, imageAlt: 'Pixel art of a pair of salsa dancers on a warmly lit dance floor.' },
  { id: 'stand-up', title: 'Perform stand-up comedy', completed: false, imageAlt: 'Pixel art of a microphone on a small comedy stage with red curtains.' },
  { id: 'sea-world', title: 'Scuba dive in SeaWorld', completed: true, imageAlt: 'Pixel art of a scuba diver beneath a manta ray in a large aquarium.' },
  { id: 'horse-canter', title: 'Canter on a horse', completed: true, imageAlt: 'Pixel art of a helmeted rider cantering on a chestnut horse.' },
  { id: 'mount-fuji', title: 'Climb Mount Fuji', completed: false, imageAlt: 'Pixel art of a hiker ascending the snow-capped volcanic cone of Mount Fuji.' },
  { id: 'dead-sea', title: 'Float on the Dead Sea', completed: true, imageAlt: 'Pixel art of a person floating on calm turquoise water beside a salt-crystal shore.' },
  { id: 'petra-walk', title: 'Walk 25km+ in one day', completed: true, details: [{ type: 'text', text: 'Completed in Petra.' }], imageAlt: 'Pixel art of a backpacked walker among Petra’s rose-red canyon walls.' },
  { id: 'marathon', title: 'Run a full marathon', completed: false, imageAlt: 'Pixel art of a runner crossing a checkered finish line with raised arms.' },
  { id: 'evanescence-concert', title: 'Attend an Evanescence concert', completed: false, inProgress: true, imageAlt: 'Pixel art of a gothic rock vocalist and grand piano under turquoise stage lights.' },
  { id: 'pokemon-go-fest', title: 'Attend Pokémon GO Fest in person', completed: true, imageAlt: 'Pixel art of a phone with a map pin at a sunny outdoor gaming festival.' },
  { id: 'enoshima-station', title: 'Visit Enoshima’s seaside station', completed: true, note: 'Where the tracks meet the sea', imageAlt: 'Pixel art of a green Enoden tram at a railway crossing beside the blue ocean.' },
  { id: 'disneyland', title: 'Visit a Disneyland', completed: true, details: [{ type: 'text', text: 'Visited Shanghai Disneyland.' }], imageAlt: 'Pixel art of a pink fairytale castle with blue turrets and golden fireworks.' },
  { id: 'tutankhamun', title: 'Meet Tutankhamun in his tomb', completed: true, imageAlt: 'Pixel art of a golden pharaoh’s sarcophagus inside a torchlit burial chamber.' },
  { id: 'deepest-pool', title: 'Dive into the deepest pool in the world', completed: true, imageAlt: 'Pixel art of a scuba diver suspended above a deep blue indoor diving shaft.' },
  { id: 'full-planche', title: 'Complete a full planche', completed: false, inProgress: true, imageAlt: 'Pixel art of an athlete balancing horizontally on parallettes in a full planche.' },
  { id: 'handstand', title: 'Do a handstand', completed: false, inProgress: true, imageAlt: 'Pixel art of an athlete holding a straight handstand on a gym mat.' },
  { id: 'five-cities', title: 'Visit five different cities in one day', completed: true, note: 'Completed in Japan', details: [{ type: 'text', text: 'Completed in Japan: Miyajima → Hiroshima → Kobe → Osaka → Kyoto.' }], imageAlt: 'Pixel art of a Japanese bullet train passing a torii gate and city skyline.' },
];
