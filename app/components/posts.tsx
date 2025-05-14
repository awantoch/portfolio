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
      <div className="space-y-4">
        {entries.map((post) => (
          <Link
            key={post.slug}
            href={`/journal/${post.slug}`}
            className="block card-base card-base--dark p-4 space-y-2 group interactive"
          >
            <div className="flex flex-col space-y-1">
              <div className="flex flex-row items-baseline gap-x-2">
                <p className="text-neutral-400 min-w-[120px] whitespace-nowrap tabular-nums">
                  {formatDate(post.metadata.publishedAt, false)}
                </p>
                <div>
                  <p className="text-neutral-100 tracking-tight font-semibold group-hover:underline">
                    {post.metadata.title}
                  </p>
                  {post.metadata.summary && (
                    <p className="text-sm text-neutral-400">
                      {post.metadata.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {showMore && (
        <div className="mt-8">
          <Link 
            href="/journal" 
            className="underline text-neutral-300 hover:opacity-80 interactive-soft"
          >
            View all entries →
          </Link>
        </div>
      )}
    </div>
  )
}
