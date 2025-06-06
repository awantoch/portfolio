import { Portfolio } from 'app/components/portfolio'
import { Education } from 'app/components/education'
import { Metadata } from 'next'
import { SITE_CONFIG, METADATA_CONFIG } from '../constants'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: METADATA_CONFIG.descriptions.portfolio,
  openGraph: {
    title: 'Portfolio | Alec M. Wantoch',
    description: METADATA_CONFIG.descriptions.portfolio,
    images: [
      {
        url: `${SITE_CONFIG.baseUrl}/og?title=${encodeURIComponent('Portfolio | Alec M. Wantoch')}&description=${encodeURIComponent(METADATA_CONFIG.descriptions.portfolio)}`,
        width: 1200,
        height: 630,
        alt: 'Portfolio | Alec M. Wantoch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | Alec M. Wantoch',
    description: METADATA_CONFIG.descriptions.portfolio,
    images: [`${SITE_CONFIG.baseUrl}/og?title=${encodeURIComponent('Portfolio | Alec M. Wantoch')}&description=${encodeURIComponent(METADATA_CONFIG.descriptions.portfolio)}`],
  },
}

export default function PortfolioPage() {
  return (
    <>
      <section role="region" aria-labelledby="portfolio-heading">
        <h1 id="portfolio-heading" className="font-semibold text-2xl mb-8 tracking-tighter">Portfolio</h1>
        <Portfolio />
      </section>
      <section role="region" aria-labelledby="education-heading">
        <h2 id="education-heading" className="font-semibold text-2xl mb-8 tracking-tighter mt-16">Education</h2>
        <Education />
      </section>
    </>
  )
} 