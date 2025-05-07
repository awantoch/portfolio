export const SITE_CONFIG = {
  title: 'Alec M. Wantoch',
  description: 'A continuous work in progress.',
  locale: 'en_US',
  language: 'en',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://wantoch.com',
} as const

export const METADATA_CONFIG = {
  keywords: [
    'Alec Wantoch',
    'Alec M. Wantoch',
    'Alec Michael Wantoch Davis',
    'product leader',
    'startup founder',
    'strategic advisor',
    'entrepreneur',
    'head of product',
    'blockchain engineer',
    'web3 gaming expert',
    'full‑stack developer',
    'security engineer',
    'Valist',
    'HyperPlay',
    'EVM developer',
    'Solidity engineer',
    'TypeScript engineer',
    'Golang engineer',
    'DevSecOps',
    'HSM architecture',
    'Eternal Events',
    'festival event producer',
    'conference speaker',
  ],
  author: 'Alec M. Wantoch',
  twitterHandle: '@alecw',
  descriptions: {
    home:
      'Entrepreneur, product leader, and computer scientist building to create real‑world impact.',
    portfolio:
      'Explore my track record founding startups, scaling product, architecting infrastructure, and delivering results.',
    journal:
      'Insights on product strategy, security, business acquisitions, and startup lifestyle.'
  }
}

export const NAV_ITEMS = {
  '/': {
    name: 'home',
  },
  '/portfolio': {
    name: 'portfolio',
  },
  '/journal': {
    name: 'journal',
  },
  'mailto:alec@wantoch.com': {
    name: 'contact me',
  },
} as const

export const OG_CONFIG = {
  defaultTitle: 'Alec M. Wantoch',
  imageWidth: 1200,
  imageHeight: 630,
} as const

export const DATE_CONFIG = {
  defaultTimeString: 'T00:00:00',
  dateLocale: 'en-us',
  dateFormat: {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  },
} as const 