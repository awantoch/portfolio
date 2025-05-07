import Link from 'next/link'
import { formatDate, getJournalPosts } from 'app/journal/utils'

type JournalEntriesProps = {
  limit?: number;
  showMore?: boolean;
};

export function JournalEntries({ limit, showMore = false }: JournalEntriesProps) {
  let allEntries = getJournalPosts()
    .sort((a, b) => {
      if (
        new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
      ) {
        return -1
      }
      return 1
    })

  const entries = limit ? allEntries.slice(0, limit) : allEntries;

  return (
    <div>
      <div>
        {entries.map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/journal/${post.slug}`}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
              <p className="text-neutral-400 w-[100px] tabular-nums">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <p className="text-neutral-100 tracking-tight">
                {post.metadata.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {showMore && (
        <div className="mt-8">
          <Link 
            href="/journal" 
            className="underline text-neutral-300 hover:opacity-80"
          >
            View all entries →
          </Link>
        </div>
      )}
    </div>
  )
}
