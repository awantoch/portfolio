import { ImageResponse } from 'next/og'
import { OG_CONFIG, METADATA_CONFIG, SITE_CONFIG, CARD_BG_COLOR, CARD_BG_COLOR_DARK } from '../constants'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const title = url.searchParams.get('title') || OG_CONFIG.defaultTitle
    const description = url.searchParams.get('description') || METADATA_CONFIG.descriptions.home
    const bg = url.searchParams.get('bg')
    const backgroundColor = bg === 'dark' ? CARD_BG_COLOR_DARK : CARD_BG_COLOR

    // Extract hostname and optional path (no protocol)
    const hostname = new URL(SITE_CONFIG.baseUrl).hostname
    const path = url.searchParams.get('path') || ''
    const websiteUrl = path ? `${hostname}${path}` : hostname

    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full items-center justify-center" style={{ backgroundColor }}>
          <div
            tw="flex flex-col items-start justify-start max-w-[900px] w-full p-14"
          >
            <h1 tw="text-6xl font-bold text-white leading-tight tracking-tight text-left">
              {title}
            </h1>
            <div tw="mt-4 flex items-start">
              <div tw="h-1 w-24 bg-blue-500/80 rounded-full" />
              <div tw="h-1 w-24 bg-purple-500/80 rounded-full mx-2" />
              <div tw="h-1 w-24 bg-pink-500/80 rounded-full" />
            </div>
            <p tw="mt-8 text-4xl text-neutral-100 max-w-[900px] font-medium leading-relaxed text-left">
              {description}
            </p>
            <p tw="mt-16 text-3xl text-neutral-400 text-left">
              {websiteUrl}
            </p>
          </div>
        </div>
      ),
      {
        width: OG_CONFIG.imageWidth,
        height: OG_CONFIG.imageHeight,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          'Content-Type': 'image/png',
        },
      }
    )
  } catch (e) {
    console.error('Error generating OG image:', e)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
