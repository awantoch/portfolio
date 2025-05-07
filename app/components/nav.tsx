import Link from 'next/link'
import { NAV_ITEMS } from '../constants'

export function Navbar() {
  return (
    <aside className="mb-6 tracking-tight flex justify-center">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start justify-center relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 justify-center">
            {Object.entries(NAV_ITEMS).map(([path, { name }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:opacity-80 flex align-middle relative py-1 px-2 m-1"
                >
                  {name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </aside>
  )
}
