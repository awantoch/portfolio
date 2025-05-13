'use client'

import dynamic from 'next/dynamic'
import Script from 'next/script'
import { SITE_CONFIG } from '../constants'

const Analytics = dynamic(() => import('@vercel/analytics/react').then(mod => mod.Analytics), {
  ssr: false,
  loading: () => null
})

const SpeedInsights = dynamic(() => import('@vercel/speed-insights/next').then(mod => mod.SpeedInsights), {
  ssr: false,
  loading: () => null
})

function GoogleAnalytics() {
  if (!SITE_CONFIG.googleAnalyticsId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.googleAnalyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${SITE_CONFIG.googleAnalyticsId}');
        `}
      </Script>
    </>
  )
}

export function AnalyticsWrapper() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
      <GoogleAnalytics />
    </>
  )
} 