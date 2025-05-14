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

let components = {
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

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
