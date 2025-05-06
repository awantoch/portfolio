export const SITE_CONFIG = {
  title: 'Alec M. Wantoch',
  description: 'A continuous work in progress.',
  locale: 'en_US',
  language: 'en',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://wantoch.com',
} as const

export const NAV_ITEMS = {
  '/': {
    name: 'home',
  },
  '/journal': {
    name: 'journal',
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