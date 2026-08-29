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

export interface Memory {
  src?: string;
  alt: string;
}

export interface FooterLink {
  label: string;
  href: string;
}

export const profile = {
  name: 'Sahaj Ramachandran',
  location: 'San Francisco Bay Area',
  coords: { display: '37.7749° N, 122.4194° W', spoken: '37.7749° north, 122.4194° west' },
  timezone: 'GMT-7',
  tagline: 'Software Engineer & Founding Team Builder',
  sub: 'Building infrastructure and products at early-stage startups for a decade — from React frontends to Kubernetes platforms and MLOps.',
  description: "Sahaj Ramachandran's personal website",
};

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

export const outro = {
  title: 'Thanks for scrolling this far.',
  sub: 'A few moments from along the way.',
};

export const memories: Memory[] = [
  { alt: 'Bengaluru' },
  { alt: 'Dubai' },
  { alt: 'San Francisco' },
  { alt: 'On the road' },
  { alt: 'Home' },
];

export const footerLinks: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/SahajR' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sahajr/' },
  { label: 'Email', href: 'mailto:hello@sahajr.com?subject=Hello%20Sahaj' },
];
