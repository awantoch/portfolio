import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getJournalPosts } from 'app/journal/utils'
import { baseUrl } from 'app/sitemap'
import Image from 'next/image'
import { SubscribeForm } from 'app/components/subscribe-form'
import { SITE_CONFIG } from 'app/constants'
import { ShareSection } from 'app/components/share-section'

export async function generateStaticParams() {
  let entries = getJournalPosts()

  return entries.map((entry) => ({
    slug: entry.slug,
  }))
}

export async function generateMetadata(props) {
  const params = await props.params;
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
  let metaOgImage = image
    ? `${baseUrl}${image}`
    : `${baseUrl}/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&path=/journal/${entry.slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/journal/${entry.slug}`,
      type: 'article',
      publishedTime,
      siteName: SITE_CONFIG.title,
      images: [
        {
          url: metaOgImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [metaOgImage],
    },
  }
}

export default async function JournalEntry(props) {
  const params = await props.params;
  let entry = getJournalPosts().find((entry) => entry.slug === params.slug)

  if (!entry) {
    notFound()
  }

  let {
    title,
    publishedAt,
    summary: description,
    image,
  } = entry.metadata
  let ogImage = image
    ? image
    : `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&path=/journal/${entry.slug}&bg=dark`

  return (
    <article itemScope itemType="https://schema.org/Article" aria-labelledby="entry-title">
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
              : `${baseUrl}/og?title=${encodeURIComponent(entry.metadata.title)}`,
            url: `${baseUrl}/journal/${entry.slug}`,
            author: {
              '@type': 'Person',
              name: SITE_CONFIG.title,
            },
          }),
        }}
      />
      <h1 id="entry-title" itemProp="headline" className="title font-semibold text-2xl tracking-tighter">
        {entry.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <time dateTime={entry.metadata.publishedAt} itemProp="datePublished" className="text-sm text-neutral-400">
          {formatDate(entry.metadata.publishedAt)}
        </time>
      </div>
      <div className="mb-8 flex justify-center">
        <div className="card-base card-base--dark p-2 max-w-3xl w-full">
          <Image
            src={ogImage}
            alt={entry.metadata.title}
            width={1200}
            height={630}
            className="rounded-lg w-full h-auto"
            priority
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMTgxODFiIi8+PC9zdmc+"
          />
        </div>
      </div>
      <ShareSection url={`${baseUrl}/journal/${entry.slug}`} title={title} slug={entry.slug} />
      <section className="prose" aria-label="Journal entry content" itemProp="articleBody" role="article">
        <CustomMDX source={entry.content} />
      </section>
      <ShareSection url={`${baseUrl}/journal/${entry.slug}`} title={title} slug={entry.slug} />
      
      <div className="mt-12">
        <SubscribeForm 
          title="Well since you read the whole thing..." 
          subtitle="'preciate it yo! Might as well subscribe 😉"
        />
      </div>
    </article>
  )
}
