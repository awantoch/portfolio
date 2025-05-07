import { ImageResponse } from 'next/og'
import { OG_CONFIG, METADATA_CONFIG } from '../constants'

export function GET(request: Request) {
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || OG_CONFIG.defaultTitle
  let description = url.searchParams.get('description') || METADATA_CONFIG.descriptions.home

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center" style={{ backgroundColor: '#18181b' }}>
        <div tw="flex flex-col w-full h-full items-center justify-center p-16">
          <div tw="flex flex-col items-center justify-center">
            <h1 tw="text-6xl font-bold text-white text-center leading-tight tracking-tight drop-shadow-lg">
              {title}
            </h1>
            <div tw="mt-4 flex items-center">
              <div tw="h-1 w-24 bg-blue-500 rounded-full shadow-lg" />
              <div tw="h-1 w-24 bg-purple-500 rounded-full mx-2 shadow-lg" />
              <div tw="h-1 w-24 bg-pink-500 rounded-full shadow-lg" />
            </div>
            <p tw="mt-8 text-xl text-neutral-100 text-center max-w-2xl drop-shadow">
              {description}
            </p>
          </div>
        </div>
      </div>
    ),
    {
      width: OG_CONFIG.imageWidth,
      height: OG_CONFIG.imageHeight,
    }
  )
}
