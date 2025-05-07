import { ImageResponse } from 'next/og'
import { OG_CONFIG, METADATA_CONFIG } from '../constants'

export function GET(request: Request) {
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || OG_CONFIG.defaultTitle
  let description = url.searchParams.get('description') || METADATA_CONFIG.descriptions.home

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800">
        <div tw="flex flex-col w-full h-full items-center justify-center p-12">
          <div tw="flex flex-col items-center justify-center">
            <h1 tw="text-6xl font-bold text-white text-center leading-tight tracking-tight">
              {title}
            </h1>
            <div tw="mt-4 flex items-center">
              <div tw="h-1 w-24 bg-blue-500 rounded-full" />
              <div tw="h-1 w-24 bg-purple-500 rounded-full mx-2" />
              <div tw="h-1 w-24 bg-pink-500 rounded-full" />
            </div>
            <p tw="mt-8 text-xl text-neutral-300 text-center max-w-2xl">
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
