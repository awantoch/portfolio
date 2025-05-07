import { JournalEntries } from 'app/components/posts'
import { Portfolio } from 'app/components/portfolio'
import { Links } from 'app/components/links'
import Image from 'next/image'
import { Metadata } from 'next'
import { SITE_CONFIG, METADATA_CONFIG } from './constants'

export const metadata: Metadata = {
  title: SITE_CONFIG.title,
  description: METADATA_CONFIG.descriptions.home,
  openGraph: {
    title: SITE_CONFIG.title,
    description: METADATA_CONFIG.descriptions.home,
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
    <section>
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
      <h1 className="mb-4 text-2xl font-semibold tracking-tighter text-center text-neutral-100">
        Alec M. Wantoch
      </h1>
      <p className="mb-4 text-center text-neutral-300">
        {METADATA_CONFIG.descriptions.home}
      </p>
      <div className="mt-8 mb-8">
        <Links />
      </div>
      <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
      <Portfolio limit={3} showMore={true} />
      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4">Journal</h2>
        <JournalEntries limit={5} showMore={true} />
      </div>
    </section>
  )
}
