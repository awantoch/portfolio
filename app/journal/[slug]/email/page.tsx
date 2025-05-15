import { notFound } from 'next/navigation'
import { getJournalPosts, formatDate } from 'app/journal/utils'
import { EmailMDX } from 'app/components/mdx'

export async function generateStaticParams() {
  const entries = getJournalPosts()
  return entries.map((entry) => ({ slug: entry.slug }))
}

export default async function EmailPage({ params }) {
  const { slug } = await params;
  const entry = getJournalPosts().find((entry) => entry.slug === slug)
  if (!entry) notFound()

  const { title, publishedAt } = entry.metadata
  return (
    <article style={{ fontFamily: 'Arial, sans-serif', color: '#000' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px' }}>
        {title}
      </h1>
      <time dateTime={publishedAt} style={{ fontSize: '14px', color: '#555', display: 'block', marginBottom: '24px' }}>
        {formatDate(publishedAt)}
      </time>
      <EmailMDX source={entry.content} />
    </article>
  )
} 