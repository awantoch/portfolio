import { JournalEntries } from 'app/components/posts'
import { Portfolio } from 'app/components/portfolio'
import { Links } from 'app/components/links'
import Image from 'next/image'

export default function Page() {
  return (
    <section>
      <div className="flex justify-center mb-6 mt-2">
        <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
          <Image
            src="/headshot.png"
            alt="Headshot"
            className="object-cover"
            width={128}
            height={128}
            priority
            quality={100}
          />
        </div>
      </div>
      <h1 className="mb-4 text-2xl font-semibold tracking-tighter text-center">
        Alec M. Wantoch
      </h1>
      <p className="mb-4 text-center">
        {`I am an entrepreneur & computer scientist that seeks to change the world for the better through practical use of technology.`}
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
