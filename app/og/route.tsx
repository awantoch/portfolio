import { ImageResponse } from 'next/og'
import { OG_CONFIG, METADATA_CONFIG, SITE_CONFIG } from '../constants'

// Add cache control
export const runtime = 'edge'

export async function GET(request: Request) {
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || OG_CONFIG.defaultTitle
  let description = url.searchParams.get('description') || METADATA_CONFIG.descriptions.home
  
  // Extract hostname and optional path (no protocol)
  const hostname = new URL(SITE_CONFIG.baseUrl).hostname
  const path = url.searchParams.get('path') || ''
  const websiteUrl = path ? `${hostname}${path}` : hostname

  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center" style={{ backgroundColor: '#20132b' }}>
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
          <p tw="mt-16 text-xl text-neutral-400 text-left">
            {websiteUrl}
          </p>
        </div>
      </div>
    ),
    {
      width: OG_CONFIG.imageWidth,
      height: OG_CONFIG.imageHeight,
      headers: {
        'Cache-Control': process.env.NODE_ENV === 'development' 
          ? 'no-store' 
          : 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Type': 'image/png',
      },
    }
  )
}
