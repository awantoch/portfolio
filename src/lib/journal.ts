import { getCollection, type CollectionEntry } from 'astro:content';

export type JournalMetadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

export type JournalPost = {
  slug: string;
  metadata: JournalMetadata;
  content: string;
  entry: CollectionEntry<'journal'>;
};

export async function getJournalPosts(): Promise<JournalPost[]> {
  const entries = await getCollection('journal', ({ data }) => !data.draft);
  return entries
    .map((entry) => ({
      slug: entry.id,
      metadata: entry.data,
      content: entry.body ?? '',
      entry,
    }))
    .sort((a, b) => Date.parse(b.metadata.publishedAt) - Date.parse(a.metadata.publishedAt));
}

export async function getJournalPost(slug: string): Promise<JournalPost | undefined> {
  return (await getJournalPosts()).find((post) => post.slug === slug);
}

export async function getJournalSlugs(): Promise<string[]> {
  return (await getJournalPosts()).map((post) => post.slug);
}
