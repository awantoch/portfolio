import React from 'react'

interface YouTubeProps {
  id: string
  title?: string
}

export function YouTube({ id, title = 'YouTube video player' }: YouTubeProps) {
  return (
    <div className="aspect-video w-full my-8">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg"
      ></iframe>
    </div>
  )
} 