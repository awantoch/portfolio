import { ArrowIcon } from './icons'

const links = [
  { href: 'https://github.com/awantoch', label: 'github' },
  { href: 'https://linkedin.com/in/awantoch', label: 'linkedin' },
  { href: 'https://instagram.com/awantoch', label: 'instagram' },
  { href: 'https://x.com/alecw', label: 'x' },
  { href: 'https://youtube.com/@AlecWantoch', label: 'youtube' },
  { href: 'mailto:alec@wantoch.com', label: 'email' },
]

export function Links() {
  return (
    <ul className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto text-neutral-300">
      {links.map(({ href, label }) => (
        <li key={href} className="text-center">
          <a
            className="flex items-center justify-center transition-all hover:opacity-80"
            rel="noopener noreferrer"
            target="_blank"
            href={href}
          >
            <ArrowIcon />
            <p className="ml-2 h-7">{label}</p>
          </a>
        </li>
      ))}
    </ul>
  )
} 