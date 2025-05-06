import { JournalEntries } from 'app/components/posts'

export const metadata = {
  title: 'Journal',
  description: 'Read my journal.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Journal</h1>
      <JournalEntries />
    </section>
  )
}
