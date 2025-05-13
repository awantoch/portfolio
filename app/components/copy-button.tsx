'use client'

import React from 'react'

export function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copyToClipboard}
      className="absolute right-2 top-2 px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
} 