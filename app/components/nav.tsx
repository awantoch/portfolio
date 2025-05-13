import Link from 'next/link'
import { NAV_ITEMS } from '../constants'

export function Navbar() {
  return (
    <aside className="mb-6 tracking-tight flex justify-center">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start justify-center md:overflow-auto md:relative"
          id="nav"
        >
          <div className="flex flex-row justify-center">
            {Object.entries(NAV_ITEMS).map(([path, { name }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="hover:opacity-80 flex align-middle py-1 px-2 m-1 interactive-soft"
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
