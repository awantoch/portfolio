import { JournalEntries } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Alec M. Wantoch
      </h1>
      <p className="mb-4">
        {`I am an entrepreneur & computer scientist that seeks to change the world for the better through the optimal use of technology.`}
      </p>
      <div className="my-8">
        <JournalEntries />
      </div>
    </section>
  )
}
