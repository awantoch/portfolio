import type { APIRoute } from 'astro';
import satori, { type Font } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import regularFont from '../lib/assets/Geist-Regular.ttf?inline';
import mediumFont from '../lib/assets/Geist-Medium.ttf?inline';
import boldFont from '../lib/assets/Geist-Bold.ttf?inline';
import { OG_CONFIG, METADATA_CONFIG, SITE_CONFIG, CARD_BG_COLOR, CARD_BG_COLOR_DARK } from '../lib/constants';

export const prerender = false;

// Vite embeds these fonts in the function bundle as data URLs.
const fontBuffer = (dataUrl: string) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
const fonts: Font[] = [
  { name: 'Geist', data: fontBuffer(regularFont), weight: 400, style: 'normal' },
  { name: 'Geist', data: fontBuffer(mediumFont), weight: 500, style: 'normal' },
  { name: 'Geist', data: fontBuffer(boldFont), weight: 700, style: 'normal' },
];

export const GET: APIRoute = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || OG_CONFIG.defaultTitle;
    const description = searchParams.get('description') || METADATA_CONFIG.descriptions.home;
    const backgroundColor = searchParams.get('bg') === 'dark' ? CARD_BG_COLOR_DARK : CARD_BG_COLOR;
    const hostname = new URL(SITE_CONFIG.baseUrl).hostname;
    const websiteUrl = `${hostname}${searchParams.get('path') || ''}`;

    // Satori accepts plain element objects; the server does not need React.
    const element = {
      type: 'div',
      props: {
        style: {
          display: 'flex', flexDirection: 'column', width: '100%', height: '100%',
          alignItems: 'center', justifyContent: 'center', backgroundColor, fontFamily: 'Geist',
        },
        children: [{
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', width: 900, padding: 56 },
            children: [
              {
                type: 'h1',
                props: {
                  style: { margin: 0, fontSize: 60, fontWeight: 700, color: '#ffffff', lineHeight: 1.25, letterSpacing: -1.5 },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', marginTop: 16, gap: 8 },
                  children: ['rgba(59,130,246,0.8)', 'rgba(168,85,247,0.8)', 'rgba(236,72,153,0.8)'].map((color) => ({
                    type: 'div',
                    props: { style: { width: 96, height: 4, borderRadius: 9999, backgroundColor: color } },
                  })),
                },
              },
              {
                type: 'p',
                props: {
                  style: { margin: 0, marginTop: 32, fontSize: 36, fontWeight: 500, color: '#f5f5f5', lineHeight: 1.625 },
                  children: description,
                },
              },
              {
                type: 'p',
                props: {
                  style: { margin: 0, marginTop: 64, fontSize: 30, fontWeight: 400, color: '#a3a3a3' },
                  children: websiteUrl,
                },
              },
            ],
          },
        }],
      },
    };
    const svg = await satori(element as Parameters<typeof satori>[0], {
      width: OG_CONFIG.imageWidth,
      height: OG_CONFIG.imageHeight,
      fonts,
    });
    const png = new Resvg(svg).render().asPng();
    return new Response(new Uint8Array(png), {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
};
