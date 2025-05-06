import { Portfolio } from 'app/components/portfolio'

export const metadata = {
  title: 'Portfolio',
  description: 'View my professional portfolio and experience.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">Portfolio</h1>
      <Portfolio />
    </section>
  )
} 