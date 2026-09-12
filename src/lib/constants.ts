export const PROFILE_CONFIG = {
  name: 'Alec M. Wantoch',
  alternateName: 'Alec Wantoch',
  role: 'CEO & Founder of BeemFlow',
  bio: 'Orthodox Christian, entrepreneur, product leader, and computer scientist building to create real-world impact.',
  homeTitle: 'Alec M. Wantoch | CEO & Founder of BeemFlow',
  homeDescription: 'CEO & Founder of BeemFlow. Orthodox Christian, entrepreneur, product leader, and computer scientist building to create real-world impact.',
  image: '/headshot.png',
  company: {
    name: 'BeemFlow',
    url: 'https://beemflow.com',
  },
  sameAs: [
    'https://instagram.com/awantoch',
    'https://x.com/alecw',
    'https://youtube.com/@AlecWantoch',
    'https://github.com/awantoch',
    'https://linkedin.com/in/awantoch',
  ],
} as const

export const SITE_CONFIG = {
  title: PROFILE_CONFIG.name,
  description: PROFILE_CONFIG.homeDescription,
  locale: 'en_US',
  language: 'en',
  baseUrl: import.meta.env?.PUBLIC_BASE_URL || import.meta.env?.NEXT_PUBLIC_BASE_URL || 'https://alec.wantoch.com',
  googleAnalyticsId: import.meta.env?.PUBLIC_GA_ID || import.meta.env?.NEXT_PUBLIC_GA_ID || 'G-2HZ0CQ2GH5',
} as const

// Add Kit form ID for subscriptions via Kit Forms API
export const KIT_FORM_ID = 8050362;

export const METADATA_CONFIG = {
  author: 'Alec M. Wantoch',
  twitterHandle: '@alecw',
  descriptions: {
    home: PROFILE_CONFIG.bio,
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
  '/journal': {
    name: 'journal',
  },
  '/portfolio': {
    name: 'portfolio',
  },
  'mailto:alec@wantoch.com': {
    name: 'contact me',
  },
} as const

export const OG_CONFIG = {
  defaultTitle: SITE_CONFIG.title,
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

// Card background colors (keep in sync with CSS variables in global.css)
export const CARD_BG_COLOR = '#20132b'
export const CARD_BG_COLOR_DARK = '#18181b'
