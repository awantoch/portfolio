'use client'

import React from 'react'
import { LinkedInIcon, XIcon, EmailIcon, LinkIcon, NativeShareIcon, ClipboardCheckIcon } from './icons'

interface ShareSectionProps {
  url: string
  title: string
  slug: string
}

export function ShareSection({ url, title, slug }: ShareSectionProps) {
  // Build UTM-tagged URLs per channel
  const encodedTitle = encodeURIComponent(title)

  const xShareUrl = `${url}?utm_source=x&utm_medium=social&utm_campaign=${slug}`
  const encodedXUrl = encodeURIComponent(xShareUrl)
  const xHref = `https://x.com/intent/tweet?url=${encodedXUrl}&text=${encodedTitle}`

  const linkedinShareUrl = `${url}?utm_source=linkedin&utm_medium=social&utm_campaign=${slug}`
  const encodedLinkedinUrl = encodeURIComponent(linkedinShareUrl)
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLinkedinUrl}`

  const emailShareUrl = `${url}?utm_source=email&utm_medium=email&utm_campaign=${slug}`
  const encodedEmailUrl = encodeURIComponent(emailShareUrl)
  const emailHref = `mailto:?subject=${encodedTitle}&body=${encodedEmailUrl}`

  const copyShareUrl = `${url}?utm_source=clipboard&utm_medium=share&utm_campaign=${slug}`
  const nativeShareUrl = `${url}?utm_source=native&utm_medium=share&utm_campaign=${slug}`
  const canNativeShare = Boolean(navigator.share)

  const [copied, setCopied] = React.useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(copyShareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-center space-x-4 my-8">
      <span className="text-sm font-semibold text-neutral-200">Share:</span>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="flex items-center justify-center card-base interactive-soft p-2 hover:shadow-lg hover:shadow-purple-700/30 focus-visible:ring-2 focus-visible:ring-purple-500 hover:scale-[1.04]"
      >
        <XIcon className="w-5 h-5 text-neutral-100" />
      </a>
      <a
        href={linkedinHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="flex items-center justify-center card-base interactive-soft p-2 hover:shadow-lg hover:shadow-purple-700/30 focus-visible:ring-2 focus-visible:ring-purple-500 hover:scale-[1.04]"
      >
        <LinkedInIcon className="w-5 h-5 text-neutral-100" />
      </a>
      <a
        href={emailHref}
        aria-label="Share via Email"
        className="flex items-center justify-center card-base interactive-soft p-2 hover:shadow-lg hover:shadow-purple-700/30 focus-visible:ring-2 focus-visible:ring-purple-500 hover:scale-[1.04]"
      >
        <EmailIcon className="w-5 h-5 text-neutral-100" />
      </a>
      <button
        onClick={handleCopy}
        aria-label="Copy share link"
        className="relative flex items-center justify-center card-base interactive-soft p-2 hover:shadow-lg hover:shadow-purple-700/30 focus-visible:ring-2 focus-visible:ring-purple-500 hover:scale-[1.04] cursor-pointer"
      >
        <LinkIcon className={`w-5 h-5 text-neutral-100 transition-all duration-200 ${copied ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`} />
        <ClipboardCheckIcon className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-neutral-100 transition-all duration-200 ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`} />
      </button>
      {canNativeShare && (
        <button
          onClick={() => navigator.share({ title, url: nativeShareUrl })}
          aria-label="Native share"
          className="flex items-center justify-center card-base interactive-soft p-2 hover:shadow-lg hover:shadow-purple-700/30 focus-visible:ring-2 focus-visible:ring-purple-500 hover:scale-[1.04] cursor-pointer"
        >
          <NativeShareIcon className="w-5 h-5 text-neutral-100" />
        </button>
      )}
    </div>
  )
} 