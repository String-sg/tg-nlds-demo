"use client"

import React from 'react'

type AssistantRichTextProps = {
  text: string
  className?: string
}

function isBulletLine(line: string): boolean {
  return /^\s*(?:[-\u2013\u2022\*])\s+/.test(line)
}

function isNumberedLine(line: string): boolean {
  return /^\s*\d+[\.)]\s+/.test(line)
}

function stripMarker(line: string): string {
  return line.replace(/^\s*(?:[-\u2013\u2022\*]|\d+[\.)])\s+/, '')
}

function looksLikeHeading(block: string): boolean {
  const singleLine = block.trim()
  if (!singleLine) return false
  // Short, no trailing period, often title-cased or ends with ")"
  return (
    singleLine.length <= 80 &&
    /[A-Za-z]/.test(singleLine) &&
    (/(\)|:)$/u.test(singleLine) || /^[A-Z0-9].+/.test(singleLine))
  )
}

function renderInline(text: string): React.ReactNode[] {
  // Basic inline formatting: **bold**, *italic*, `code`
  const parts: React.ReactNode[] = []
  let remaining = text
  // Simple, non-greedy passes; order matters
  const pushText = (t: string) => {
    if (!t) return
    parts.push(t)
  }

  // Replace backtick code first
  remaining = remaining.replace(/`([^`]+)`/g, (_m, p1) => {
    parts.push(
      <code key={`code-${parts.length}`} className="rounded bg-muted px-1 py-0.5 text-[0.9em]">
        {String(p1)}
      </code>
    )
    return '\u0000' // placeholder for consumed segment
  })

  // Split by placeholder to interleave
  const codeSplit = remaining.split('\u0000')
  for (let i = 0; i < codeSplit.length; i++) {
    const seg = codeSplit[i]
    // bold
    let tmpParts: React.ReactNode[] = []
    let tmp = seg
    tmp = tmp.replace(/\*\*([^*]+)\*\*/g, (_m, p1) => {
      tmpParts.push(
        <strong key={`b-${parts.length}-${tmpParts.length}`}>{String(p1)}</strong>
      )
      return '\u0001'
    })
    const boldSplit = tmp.split('\u0001')
    for (let j = 0; j < boldSplit.length; j++) {
      const seg2 = boldSplit[j]
      // italic
      let italParts: React.ReactNode[] = []
      let ital = seg2
      ital = ital.replace(/\*([^*]+)\*/g, (_m, p1) => {
        italParts.push(
          <em key={`i-${parts.length}-${tmpParts.length}-${italParts.length}`}>{
            String(p1)
          }</em>
        )
        return '\u0002'
      })
      const italSplit = ital.split('\u0002')
      // Interleave plain/italic
      for (let k = 0; k < italSplit.length; k++) {
        pushText(italSplit[k])
        if (k < italParts.length) parts.push(italParts[k])
      }
      // After each plain segment, add bold if available
      if (j < tmpParts.length) parts.push(tmpParts[j])
    }
    // After each segment, add code if available
    // (already interleaved via placeholder splitting)
  }

  return parts
}

export function AssistantRichText({ text, className }: AssistantRichTextProps) {
  // Handle simple fenced code blocks ```
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const blocks: string[] = []
  let buffer: string[] = []
  let inCode = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        // close code block
        blocks.push(['```', ...buffer, '```'].join('\n'))
        buffer = []
        inCode = false
      } else {
        if (buffer.length) {
          blocks.push(buffer.join('\n'))
          buffer = []
        }
        inCode = true
      }
      continue
    }
    buffer.push(line)
  }
  if (buffer.length) blocks.push(buffer.join('\n'))

  const renderBlock = (block: string, idx: number) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    // Code block
    if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
      const code = trimmed.replace(/^```\n?/, '').replace(/\n?```$/, '')
      return (
        <pre key={`pre-${idx}`} className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs">
          <code>{code}</code>
        </pre>
      )
    }

    const lines = trimmed.split('\n').filter(Boolean)
    const allBullet = lines.every(isBulletLine)
    const allNumbered = lines.every(isNumberedLine)

    if (allBullet) {
      return (
        <ul key={`ul-${idx}`} className="list-disc pl-5 space-y-1 marker:text-muted-foreground">
          {lines.map((l, i) => (
            <li key={`uli-${i}`}>{renderInline(stripMarker(l))}</li>
          ))}
        </ul>
      )
    }

    if (allNumbered) {
      return (
        <ol key={`ol-${idx}`} className="list-decimal pl-5 space-y-1 marker:text-muted-foreground">
          {lines.map((l, i) => (
            <li key={`oli-${i}`}>{renderInline(stripMarker(l))}</li>
          ))}
        </ol>
      )
    }

    // Single-line heading style
    if (lines.length === 1 && looksLikeHeading(lines[0])) {
      return (
        <div key={`h-${idx}`} className="font-semibold">
          {renderInline(lines[0])}
        </div>
      )
    }

    // Default paragraph(s)
    return (
      <div key={`p-${idx}`} className="space-y-1">
        {lines.map((l, i) => (
          <p key={`p-${idx}-${i}`} className="leading-6">
            {renderInline(l)}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className={className ? className : undefined}>
      <div className="space-y-2">{blocks.map(renderBlock)}</div>
    </div>
  )
}

export default AssistantRichText


