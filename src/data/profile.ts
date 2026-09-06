import type { AlbumKey } from './albums';
import type { IconKey } from '../icons';

export interface CaseStudy {
  title: string;
  desc: string;
  href: string;
  /** Up to three screenshot paths (left, middle, right). Optional for now. */
  shots?: string[];
}

export interface Org {
  name: string;
  href?: string;
  /** Path under /public. Falls back to an initial-letter avatar when absent. */
  logo?: string;
}

export interface TimelineEntry {
  year: string;
  /** Short gutter label above the year, e.g. an airport / city code. */
  route?: string;
  company: string;
  href?: string;
  role: string;
  desc: string;
  current?: boolean;
  orgs: Org[];
  cases?: CaseStudy[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export const profile = {
  name: 'Sahaj Ramachandran',
  tagline: "Hi, I'm Sahaj, programmer & adventurer of the world",
  sub: '',
  description: "Sahaj Ramachandran's personal website",
};

/** A fragment of the closing line; an <AlbumStack> follows it when `album` is set. */
export interface ClosingPart {
  text: string;
  album?: AlbumKey;
  rotation?: number;
}

/** A fragment of a paragraph; an inline icon follows it when `icon` is set. */
export interface TextPart {
  text: string;
  icon?: IconKey;
}

/** A paragraph: a plain string, or parts interleaved with inline icons. */
export type RichParagraph = string | TextPart[];

/**
 * One stop on the journey path. Not time-based — each part reveals a little
 * more as the reader scrolls. The rail alternates sides per part.
 */
export interface JourneyPart {
  id: string;
  label: string;
  title: string;
  paragraphs?: RichParagraph[];
  focusIntro?: string;
  focus?: string[];
  closing?: ClosingPart[];
}

/**
 * A region of the journey. The rail is continuous across regions; each region
 * is entered through a cloud layer that names it.
 */
export interface JourneyRegion {
  id: string;
  name: string;
  /** The large centred line inside the region's dialog window. */
  description: string;
  /** Dot + wash colour for the region's dialog window. */
  accent: string;
  /** Icon marking each stop on the rail in this region. Defaults to a star. */
  stopIcon?: IconKey;
  parts: JourneyPart[];
}

const workParts: JourneyPart[] = [
  {
    id: 'origins',
    label: '01',
    title: 'Origins',
    paragraphs: [
      [
        { text: "I've been programming since I was 16, starting with ROM hacks for GBA", icon: 'gba' },
        { text: " Pokémon games. I've been hooked ever since." },
      ],
    ],
  },
  {
    id: 'stack',
    label: '02',
    title: 'Across the stack',
    paragraphs: [
      [
        { text: "Over the years I've worked across the stack — front-end in Android", icon: 'android' },
        { text: " and React (back when Next.js wasn't even mainstream), and games and 3D graphics in Unity", icon: 'cube' },
        { text: '.' },
      ],
      [
        { text: 'From there to backend systems in Node.js and Go', icon: 'terminal' },
        { text: ", then orchestrating whole platforms in Kubernetes", icon: 'server' },
        { text: ", for which I'm a certified Kubernetes Administrator." },
      ],
    ],
  },
  {
    id: 'now',
    label: '03',
    title: 'These days',
    paragraphs: [
      [
        { text: "It's GPU-accelerated machine learning", icon: 'ai' },
        { text: ' and distributed systems.' },
      ],
    ],
    focusIntro: 'My current development and research has shifted towards:',
    focus: [
      'improving the infrastructure and optimisations behind voice-agent systems',
      "building custom integrations, and tuning custom voice and small language models to fit our clients' enterprise systems",
      'scaling virtual-machine sandboxes for the core agent loops behind human-like, action-capable agents',
    ],
  },
];

const interestParts: JourneyPart[] = [
  {
    id: 'real-world',
    label: '04',
    title: 'The real world',
    closing: [
      { text: 'I dive through skies', album: 'skydive', rotation: -7 },
      { text: ' and oceans', album: 'scuba', rotation: 5 },
      { text: ' alike, and race the earth on machines — mechanical', album: 'mx', rotation: -9 },
      { text: ' or otherwise', album: 'eq', rotation: 6 },
      { text: '.' },
    ],
  },
];

export const journey: JourneyRegion[] = [
  {
    id: 'work',
    name: 'Work',
    description: 'What I build, and what I build it with.',
    accent: '#7aa2e8',
    stopIcon: 'work',
    parts: workParts,
  },
  {
    id: 'interests',
    name: 'Interests',
    description: 'Life beyond the keyboard.',
    accent: '#e87aa4',
    stopIcon: 'telescope',
    parts: interestParts,
  },
];

export const timeline: TimelineEntry[] = [
  {
    year: '2024',
    route: 'BLR>SFO',
    company: 'CozmoX AI',
    href: 'https://cozmox.ai',
    role: 'Founding Team · Engineering',
    desc: 'YC W22 startup in the Bay Area. Own infrastructure and MLOps — Kubernetes, platform tooling, and the systems that keep AI products running.',
    current: true,
    orgs: [{ name: 'CozmoX AI', href: 'https://cozmox.ai' }],
    cases: [
      {
        title: 'Platform infrastructure',
        desc: 'Kubernetes and MLOps foundations for shipping AI at speed',
        href: '/cozmox',
      },
    ],
  },
  {
    year: '2022',
    route: 'BLR>DXB',
    company: 'Zywa',
    href: 'https://zywa.co',
    role: 'Founding Team · Engineering',
    desc: 'YC W22 fintech for teens in the UAE. Platform engineering across the stack — Android, React, and the Kubernetes footprint underneath.',
    orgs: [{ name: 'Zywa', href: 'https://zywa.co' }],
    cases: [
      {
        title: 'Zywa',
        desc: 'Banking and payments built for Gen Z in the Middle East',
        href: '/zywa',
      },
    ],
  },
  {
    year: '2021',
    route: 'BLR',
    company: 'Quoti',
    role: 'Lead Architect & Co-founder',
    desc: 'Chat-based, AI-powered SaaS for physical commodity trading. Led architecture; set up immutable Terraform infrastructure deployed via GitOps with Tekton and ArgoCD.',
    orgs: [{ name: 'Quoti' }],
  },
  {
    year: '2017',
    route: 'BLR',
    company: 'Safartastic',
    role: 'CTO & Co-founder',
    desc: 'Tech consultancy helping startups build proof-of-concept applications and validate their strategy. Also lead developer at TripShire, a B2B travel-booking platform, migrating its React app to Next.js.',
    orgs: [{ name: 'Safartastic' }, { name: 'TripShire' }],
    cases: [
      {
        title: 'TripShire',
        desc: 'Instant holiday-package customisation and booking for travel agents',
        href: '/tripshire',
      },
    ],
  },
  {
    year: '2015',
    route: 'BLR',
    company: 'Housing.com',
    href: 'https://housing.com',
    role: 'Software Engineer Intern',
    desc: 'Built an application for viewing housing interiors and plots remotely in virtual reality. Earlier that year, front-end and graphic design intern at Analyttica Datalab.',
    orgs: [{ name: 'Housing.com', href: 'https://housing.com' }, { name: 'Analyttica' }],
  },
];

export const footerLinks: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/SahajR' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sahajr/' },
  { label: 'Email', href: 'mailto:hello@sahajr.com?subject=Hello%20Sahaj' },
];
