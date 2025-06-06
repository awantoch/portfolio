'use client'

import React from 'react'

export function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(content)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copyToClipboard}
      aria-live="polite"
      aria-atomic="true"
      className="absolute z-10 right-2 top-2 px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
} 