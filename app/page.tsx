import { JournalEntries } from 'app/components/posts'
import { Portfolio } from 'app/components/portfolio'
import { Links } from 'app/components/links'
import Image from 'next/image'
import { Metadata } from 'next'
import { SITE_CONFIG, METADATA_CONFIG } from './constants'
import { SubscribeForm } from './components/subscribe-form'

export const metadata: Metadata = {
  title: SITE_CONFIG.title,
  description: METADATA_CONFIG.descriptions.home,
  openGraph: {
    title: SITE_CONFIG.title,
    description: METADATA_CONFIG.descriptions.home,
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.title,
    images: [
      {
        url: `${SITE_CONFIG.baseUrl}/og?title=${encodeURIComponent(SITE_CONFIG.title)}&description=${encodeURIComponent(METADATA_CONFIG.descriptions.home)}`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: METADATA_CONFIG.descriptions.home,
    images: [`${SITE_CONFIG.baseUrl}/og?title=${encodeURIComponent(SITE_CONFIG.title)}&description=${encodeURIComponent(METADATA_CONFIG.descriptions.home)}`],
  },
}

export default function Page() {
  return (
    <section aria-labelledby="home-heading">
      <div className="flex justify-center mb-6 mt-2">
        <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-neutral-800 bg-neutral-900 flex items-center justify-center">
          <Image
            src="/headshot.png"
            alt="Headshot"
            className="object-cover"
            width={128}
            height={128}
            priority
            quality={85}
          />
        </div>
      </div>
      <h1 id="home-heading" className="mb-4 text-2xl font-semibold tracking-tighter text-center text-neutral-100">
        Alec M. Wantoch
      </h1>
      <p className="mb-4 text-center text-neutral-300">
        {METADATA_CONFIG.descriptions.home}
      </p>
      <div className="mt-8 mb-8">
        <Links />
      </div>
      <section role="region" aria-labelledby="journal-heading" className="my-8">
        <h2 id="journal-heading" className="text-xl font-semibold mb-4">Journal</h2>
        <JournalEntries limit={5} showMore={true} />
      </section>
      
      <div className="my-10">
        <SubscribeForm 
          title="Stay in the loop" 
          subtitle="Get notified from my personal email when I publish new content" 
          compact={true}
        />
      </div>
      
      <section role="region" aria-labelledby="portfolio-heading" className="my-8">
        <h2 id="portfolio-heading" className="text-xl font-semibold mb-4">Portfolio</h2>
        <Portfolio limit={3} showMore={true} />
      </section>
    </section>
  )
}
