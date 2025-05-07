function ArrowIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      width="16"
      height="16"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

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
    <ul className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto text-neutral-600 dark:text-neutral-300">
      {links.map(({ href, label }) => (
        <li key={href} className="text-center">
          <a
            className="flex items-center justify-center transition-all hover:text-neutral-800 dark:hover:text-neutral-100"
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