import fs from 'fs'
import path from 'path'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    metadata[key.trim() as keyof Metadata] = value
  })

  return { metadata: metadata as Metadata, content }
}

// Directory containing MDX files
const postsDirectory = path.join(process.cwd(), 'app', 'journal', 'posts')

/**
 * Return all slugs (filenames without extension) for journal posts
 */
export function getJournalSlugs(): string[] {
  return fs.readdirSync(postsDirectory)
    .filter((file) => path.extname(file) === '.mdx')
    .map((file) => path.basename(file, path.extname(file)))
}

/**
 * Read and parse a single journal post by slug
 */
export function getJournalPost(slug: string): { metadata: Metadata; content: string; slug: string } {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf-8')
  const { metadata, content } = parseFrontmatter(fileContents)
  return { metadata, content, slug }
}

/**
 * Return all journal posts by mapping slugs to their content
 */
export function getJournalPosts() {
  return getJournalSlugs().map(getJournalPost)
}

// (no re-exports)
