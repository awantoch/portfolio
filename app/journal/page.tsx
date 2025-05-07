import { JournalEntries } from 'app/components/posts'
import { Metadata } from 'next'
import { SITE_CONFIG, METADATA_CONFIG } from '../constants'

export const metadata: Metadata = {
  title: 'Journal',
  description: METADATA_CONFIG.descriptions.journal,
  openGraph: {
    title: 'Journal | Alec M. Wantoch',
    description: METADATA_CONFIG.descriptions.journal,
    images: [
      {
        url: `${SITE_CONFIG.baseUrl}/og?title=${encodeURIComponent('Journal | Alec M. Wantoch')}&description=${encodeURIComponent(METADATA_CONFIG.descriptions.journal)}`,
        width: 1200,
        height: 630,
        alt: 'Journal | Alec M. Wantoch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Journal | Alec M. Wantoch',
    description: METADATA_CONFIG.descriptions.journal,
    images: [`${SITE_CONFIG.baseUrl}/og?title=${encodeURIComponent('Journal | Alec M. Wantoch')}&description=${encodeURIComponent(METADATA_CONFIG.descriptions.journal)}`],
  },
}

export default function JournalPage() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Journal</h1>
      <JournalEntries />
    </section>
  )
}
