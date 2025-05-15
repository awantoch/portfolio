import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import { CopyButton } from './copy-button'

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props} className="interactive-soft">
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} className="interactive-soft" />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} className="interactive-soft" />
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

// Override for fenced code blocks
function Pre({ children, ...props }) {
  // MDX gives us <pre><code /></pre>; children is the single <code> element
  const codeElement = React.Children.only(children)
  const { className = '', children: codeChildren } = codeElement.props
  // Flatten code content to a string
  const codeString = Array.isArray(codeChildren) ? codeChildren.join('') : String(codeChildren)
  const langMatch = className.match(/language-(\w+)/)
  const language = langMatch?.[1] ?? ''
  const isMarkdown = language === 'markdown'
  // Only highlight non-markdown fences
  const highlighted = isMarkdown ? codeString : highlight(codeString)

  return (
    <div className="relative group">
      <CopyButton content={codeString} />
      <pre className={`${className} whitespace-pre-wrap break-words`} {...props}>
        {isMarkdown ? (
          // Markdown fences: render as plain text
          <code className={className}>{codeString}</code>
        ) : (
          // Other languages: inject highlighted HTML
          <code
            className={className}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        )}
      </pre>
    </div>
  )
}

// Simple inline code renderer
function InlineCode({ className, children, ...props }) {
  return <code className={className} {...props}>{children}</code>
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

// Email-safe MDX component variants
const emailComponents = {
  h1: ({ children }) => (
    <h1
      style={{
        fontSize: '2.25rem',
        fontWeight: 700,
        margin: '32px 0 16px 0',
        color: '#fff',
        letterSpacing: '-0.025em',
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      style={{
        fontSize: '1.5rem',
        fontWeight: 600,
        margin: '28px 0 12px 0',
        color: '#fff',
        letterSpacing: '-0.025em',
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        margin: '24px 0 10px 0',
        color: '#fff',
        letterSpacing: '-0.025em',
      }}
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        margin: '20px 0 8px 0',
        color: '#fff',
        letterSpacing: '-0.015em',
      }}
    >
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5
      style={{
        fontSize: '1rem',
        fontWeight: 600,
        margin: '18px 0 6px 0',
        color: '#fff',
      }}
    >
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6
      style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        margin: '16px 0 4px 0',
        color: '#fff',
      }}
    >
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p
      style={{
        fontSize: '1rem',
        lineHeight: 1.6,
        margin: '16px 0',
        color: '#fff',
      }}
    >
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      style={{
        color: '#fff',
        textDecoration: 'underline',
        textDecorationColor: '#fff',
        textUnderlineOffset: '2px',
        textDecorationThickness: '1px',
      }}
    >
      {children}
    </a>
  ),
  img: ({ alt, src }) => (
    <img
      src={src}
      alt={alt}
      style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto 16px' }}
    />
  ),
  pre: ({ children }) => (
    <pre
      style={{
        background: '#18181b',
        color: '#e5e7eb',
        padding: '12px 16px',
        border: '1px solid #27272a',
        borderRadius: '8px',
        overflowX: 'auto',
        margin: '18px 0',
        fontFamily: 'monospace',
        fontSize: '15px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = typeof className === 'string' && className.startsWith('language-')
    if (isBlock) {
      return <code className={className} {...props}>{children}</code>
    }
    return (
      <code
        style={{
          background: '#282a36',
          color: '#fff',
          padding: '2px 6px',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '0.95em',
        }}
        {...props}
      >
        {children}
      </code>
    )
  },
  table: ({ children }) => (
    <table
      style={{
        borderCollapse: 'collapse',
        width: '100%',
        margin: '18px 0',
        color: '#fff',
      }}
    >
      {children}
    </table>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: '1px solid #444',
        padding: '8px',
        background: '#232136',
        color: '#fff',
        fontWeight: 600,
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: '1px solid #444', padding: '8px', color: '#fff' }}>
      {children}
    </td>
  ),
  Table: Table,
  Image: RoundedImage,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '4px solid #6b7280', // neutral-600
        paddingLeft: '1em',
        fontStyle: 'italic',
        color: '#a3a3a3', // neutral-400
        margin: '16px 0',
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul
      style={{
        listStyleType: 'disc',
        paddingLeft: '1.5em',
        color: '#fff',
        margin: '16px 0',
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        listStyleType: 'decimal',
        paddingLeft: '1.5em',
        color: '#fff',
        margin: '16px 0',
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '6px' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600 }}>{children}</strong>
  ),
}

// Rename original override map to webComponents
const webComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  pre: Pre,
  Image: RoundedImage,
  a: CustomLink,
  code: InlineCode,
  Table,
}

// Enforce that every web component has a matching email variant
type ComponentKey = keyof typeof webComponents
type ComponentVariants = {
  [K in ComponentKey]: {
    web: typeof webComponents[K]
    email: typeof emailComponents[K]
  }
}

const componentVariants: ComponentVariants = {
  h1: { web: webComponents.h1, email: emailComponents.h1 },
  h2: { web: webComponents.h2, email: emailComponents.h2 },
  h3: { web: webComponents.h3, email: emailComponents.h3 },
  h4: { web: webComponents.h4, email: emailComponents.h4 },
  h5: { web: webComponents.h5, email: emailComponents.h5 },
  h6: { web: webComponents.h6, email: emailComponents.h6 },
  pre: { web: webComponents.pre, email: emailComponents.pre },
  a: { web: webComponents.a, email: emailComponents.a },
  code: { web: webComponents.code, email: emailComponents.code },
  Table: { web: webComponents.Table, email: emailComponents.Table },
  Image: { web: webComponents.Image, email: emailComponents.Image },
}

// Derive final sets for MDXRemote
const componentsForWeb = Object.fromEntries(
  Object.entries(componentVariants).map(([k, v]) => [k, v.web])
) as Record<ComponentKey, any>
const componentsForEmail = Object.fromEntries(
  Object.entries(componentVariants).map(([k, v]) => [k, v.email])
) as Record<ComponentKey, any>

// Export wrappers
export function CustomMDX(props) {
  return <MDXRemote {...props} components={componentsForWeb} />
}

export function EmailMDX(props) {
  return <MDXRemote {...props} components={componentsForEmail} />
}
