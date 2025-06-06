import { JournalEntries } from 'app/components/posts'
import { Metadata } from 'next'
import { SITE_CONFIG, METADATA_CONFIG } from '../constants'
import { SubscribeForm } from 'app/components/subscribe-form'

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
    <section role="region" aria-labelledby="journal-heading">
      <h1 id="journal-heading" className="font-semibold text-2xl mb-8 tracking-tighter">Journal</h1>
      <JournalEntries />
      
      <div className="mt-12">
        <SubscribeForm 
          title="Join the adventure" 
          subtitle="Follow along the journey with new entries & other goodies!"
        />
      </div>
    </section>
  )
}
