import {
  GitHubIcon,
  LinkedInIcon,
  InstagramIcon,
  XIcon,
  YouTubeIcon,
  EmailIcon,
} from './icons'

const links = [
  { href: 'https://github.com/awantoch', label: 'GitHub', icon: GitHubIcon },
  { href: 'https://linkedin.com/in/awantoch', label: 'LinkedIn', icon: LinkedInIcon },
  { href: 'https://instagram.com/awantoch', label: 'Instagram', icon: InstagramIcon },
  { href: 'https://x.com/alecw', label: 'X/Twitter', icon: XIcon },
  { href: 'https://youtube.com/@AlecWantoch', label: 'YouTube', icon: YouTubeIcon },
  { href: 'mailto:alec@wantoch.com', label: 'Email', icon: EmailIcon },
]

function SocialLink({ href, label, Icon }: { href: string; label: string; Icon: React.FC<{ className?: string }> }) {
  return (
    <a
      className="flex flex-col items-center justify-center gap-2 card-base interactive-soft py-2 sm:py-4 transition-all duration-200 hover:shadow-lg hover:shadow-purple-700/30 focus-visible:ring-2 focus-visible:ring-purple-500 hover:scale-[1.04]"
      rel="noopener noreferrer"
      target="_blank"
      href={href}
      aria-label={label}
    >
      <Icon className="w-6 h-6 mb-1 sm:w-7 sm:h-7 text-neutral-100" />
      <span className="text-xs sm:text-sm font-medium text-neutral-200 tracking-tight capitalize">{label}</span>
    </a>
  )
}

export function Links() {
  return (
    <ul className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
      {links.map(({ href, label, icon: Icon }) => (
        <li key={href} className="text-center">
          <SocialLink href={href} label={label} Icon={Icon} />
        </li>
      ))}
    </ul>
  )
} 