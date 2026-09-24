import { Fragment, type ReactNode } from 'react'

/**
 * Minimal, safe Markdown renderer for generated drafts: headings, bold,
 * italics, bullet/numbered lists and paragraphs. Renders React nodes only —
 * no HTML injection.
 */
export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  let para: string[] = []

  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={blocks.length} className="my-4 text-[15.5px] leading-[1.8] text-ink/90">{inline(para.join(' '))}</p>)
      para = []
    }
  }
  const flushList = () => {
    if (list) {
      const Tag = list.ordered ? 'ol' : 'ul'
      blocks.push(
        <Tag key={blocks.length} className={`my-4 space-y-2 pl-6 text-[15.5px] leading-[1.75] text-ink/90 ${list.ordered ? 'list-decimal' : 'list-disc'} marker:text-ink-soft/50`}>
          {list.items.map((it, i) => <li key={i} className="pl-1">{inline(it)}</li>)}
        </Tag>,
      )
      list = null
    }
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) { flushPara(); flushList(); continue }

    const heading = line.match(/^(#{1,4})\s+(.*)$/) ?? line.match(/^\*\*([^*]+)\*\*:?$/)
    if (heading) {
      flushPara(); flushList()
      const content = heading.length === 3 ? heading[2] : heading[1]
      const level = heading.length === 3 ? heading[1].length : 3
      blocks.push(
        level <= 2
          ? <h2 key={blocks.length} className="mb-3 mt-9 font-display text-[26px] text-ink first:mt-0">{inline(content)}</h2>
          : <h3 key={blocks.length} className="mb-2 mt-7 text-[16px] font-semibold tracking-[-0.01em] text-ink first:mt-0">{inline(content.replace(/:$/, ''))}</h3>,
      )
      continue
    }

    const bullet = line.match(/^[-*•]\s+(.*)$/)
    const numbered = line.match(/^\d+[.)]\s+(.*)$/)
    if (bullet || numbered) {
      flushPara()
      const ordered = !!numbered
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] } }
      list.items.push((bullet ?? numbered)![1])
      continue
    }

    flushList()
    para.push(line)
  }
  flushPara(); flushList()

  return <>{blocks}</>
}

/** **bold** and *italic* inside a line. */
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    return <Fragment key={i}>{part}</Fragment>
  })
}
