import { JournalEntries } from 'app/components/posts'
import { Portfolio } from 'app/components/portfolio'
import { Links } from 'app/components/links'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Alec M. Wantoch
      </h1>
      <p className="mb-4">
        {`I am an entrepreneur & computer scientist that seeks to change the world for the better through the optimal use of technology.`}
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
