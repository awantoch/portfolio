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
      <pre className={className} {...props}>
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
        fontSize: '36px',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginTop: '24px',
        marginBottom: '8px',
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      style={{
        fontSize: '20px',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginTop: '24px',
        marginBottom: '8px',
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        fontSize: '20px',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginTop: '24px',
        marginBottom: '8px',
      }}
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      style={{
        fontSize: '18px',
        fontWeight: 500,
        letterSpacing: '-0.025em',
        marginTop: '24px',
        marginBottom: '8px',
      }}
    >
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5
      style={{
        fontSize: '16px',
        fontWeight: 500,
        marginTop: '16px',
        marginBottom: '6px',
      }}
    >
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6
      style={{
        fontSize: '14px',
        fontWeight: 500,
        marginTop: '14px',
        marginBottom: '4px',
      }}
    >
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p
      style={{
        fontSize: '16px',
        lineHeight: 1.5,
        margin: '16px 0',
      }}
    >
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      style={{
        color: '#ffffff',
        textDecoration: 'underline',
        textDecorationColor: '#ffffff',
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
        padding: '8px 12px',
        border: '1px solid #27272a',
        borderRadius: '8px',
        overflowX: 'auto',
        margin: '16px 0',
        fontFamily: 'monospace',
        fontSize: '14px',
        lineHeight: 1.5,
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
          background: '#f6f8fa',
          padding: '2px 4px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '20px',
          color: '#1f2937',
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
        margin: '16px 0',
      }}
    >
      {children}
    </table>
  ),
  th: ({ children }) => (
    <th
      style={{
        border: '1px solid #ddd',
        padding: '8px',
        background: '#f6f8fa',
        fontWeight: 500,
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
      {children}
    </td>
  ),
  Table: Table,
  Image: RoundedImage,
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
