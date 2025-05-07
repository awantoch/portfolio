import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getJournalPosts } from 'app/journal/utils'
import { baseUrl } from 'app/sitemap'

export async function generateStaticParams() {
  let entries = getJournalPosts()

  return entries.map((entry) => ({
    slug: entry.slug,
  }))
}

export function generateMetadata({ params }) {
  let entry = getJournalPosts().find((entry) => entry.slug === params.slug)
  if (!entry) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = entry.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/journal/${entry.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default function JournalEntry({ params }) {
  let entry = getJournalPosts().find((entry) => entry.slug === params.slug)

  if (!entry) {
    notFound()
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: entry.metadata.title,
            datePublished: entry.metadata.publishedAt,
            dateModified: entry.metadata.publishedAt,
            description: entry.metadata.summary,
            image: entry.metadata.image
              ? `${baseUrl}${entry.metadata.image}`
              : `/og?title=${encodeURIComponent(entry.metadata.title)}`,
            url: `${baseUrl}/journal/${entry.slug}`,
            author: {
              '@type': 'Person',
              name: 'Alec M. Wantoch',
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {entry.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-400">
          {formatDate(entry.metadata.publishedAt)}
        </p>
      </div>
      <article className="prose">
        <CustomMDX source={entry.content} />
      </article>
    </section>
  )
}
