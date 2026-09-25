/**
 * Draft downloads: Markdown as written, plain text with the Markdown stripped,
 * and a real PowerPoint deck for slide-deck drafts. Everything is built in the browser.
 */

export type ExportKind = 'md' | 'txt' | 'pptx'

export function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Give the browser a moment to start the download before the URL is released.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** "Executive Summary" → "executive-summary" */
export function fileSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'draft'
}

/** Inline Markdown → plain words: bold, italics, code, links. */
function stripInline(s: string) {
  return s
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|[^*\w])[*_]([^*_\n]+)[*_](?=[^*\w]|$)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
}

/** Markdown → readable plain text. Keeps structure (lines, bullets, table cells), drops the syntax. */
export function toPlainText(md: string) {
  return md
    .split('\n')
    .filter((line) => !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line)) // table divider rows
    .filter((line) => !/^\s*([-*_])\s*(\1\s*){2,}$/.test(line)) // horizontal rules
    .map((line) => {
      let l = line.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/^\s*>\s?/, '')
      l = l.replace(/^(\s*)[*+]\s+/, '$1- ')
      if (/^\s*\|.*\|\s*$/.test(l)) l = l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()).join('  |  ')
      return stripInline(l).trimEnd()
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n'
}

/* ─── Slide deck → PowerPoint ─────────────────────────────────────────────── */

export interface Slide {
  title: string
  bullets: string[]
  notes: string
  visual: string
}

const SLIDE_HEADING = /^\s*(?:#{1,6}\s*)?[*_]*\s*slide\s*(\d+)\s*[*_]*\s*[:.)\-–—]?\s*(.*)$/i
const LABEL = /^\s*[-*•]?\s*[*_]*\s*(speaker notes?|notes|visual(?:\s+suggestion)?|suggested visual|title|bullets?(?:\s+points?)?)\s*[*_]*\s*[:：]\s*[*_]*\s*(.*)$/i

/**
 * Split a slide-deck draft into slides. The prompt asks for "## Slide N: Title", bullets,
 * "**Speaker notes:**" and "**Visual:**", but models drift, so this accepts the common variants.
 */
export function parseSlides(md: string): Slide[] {
  const slides: Slide[] = []
  let cur: Slide | null = null
  let field: 'bullets' | 'notes' | 'visual' = 'bullets'

  for (const raw of md.split('\n')) {
    const heading = SLIDE_HEADING.exec(raw)
    if (heading) {
      cur = { title: stripInline(heading[2]).replace(/[*_]+$/, '').trim(), bullets: [], notes: '', visual: '' }
      slides.push(cur)
      field = 'bullets'
      continue
    }
    if (!cur || !raw.trim()) continue

    const label = LABEL.exec(raw)
    if (label) {
      const key = label[1].toLowerCase()
      const rest = stripInline(label[2]).trim()
      if (key === 'title') { if (rest) cur.title = rest; continue }
      field = key.startsWith('bullet') ? 'bullets' : /note/.test(key) ? 'notes' : 'visual'
      if (rest) {
        if (field === 'bullets') cur.bullets.push(rest)
        else cur[field] = cur[field] ? `${cur[field]} ${rest}` : rest
      }
      continue
    }

    const text = stripInline(raw.replace(/^\s*(?:[-*+•]|\d+[.)])\s+/, '')).trim()
    if (!text || /^[-*_]{3,}$/.test(text)) continue
    if (field === 'bullets') cur.bullets.push(text)
    else cur[field] = cur[field] ? `${cur[field]} ${text}` : text
  }

  // A slide heading with no title still deserves one on the slide itself.
  return slides.map((s, i) => ({ ...s, title: s.title || `Slide ${i + 1}` }))
}

// Brand palette (index.css): ink, paper, matcha, logo green.
const INK = '0F100F'
const INK_MUTE = '5D5F57'
const PAPER = 'FAF9F5'
const MATCHA = 'D4ED64'
const LOGO_GREEN = '213833'

/** Build a .pptx: a dark title slide, then one slide per section with bullets, speaker notes and the visual idea. */
export async function buildPptx(md: string, deckTitle: string): Promise<Blob> {
  const slides = parseSlides(md)
  if (slides.length === 0) {
    throw new Error('This draft has no "Slide 1:", "Slide 2:" headings to build slides from. Refine it with “format as numbered slides”, then download again.')
  }

  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE' // 13.33 × 7.5 in
  pptx.title = deckTitle
  pptx.company = 'Sankshep.ai'

  slides.forEach((s, i) => {
    const slide = pptx.addSlide()
    const notes = [s.notes, s.visual && `Suggested visual: ${s.visual}`].filter(Boolean).join('\n\n')
    if (notes) slide.addNotes(notes)

    if (i === 0) {
      // Title slide: logo green ground, matcha rule, big title, first bullet as subtitle.
      slide.background = { color: LOGO_GREEN }
      slide.addShape(pptx.ShapeType.rect, { x: 0.9, y: 2.55, w: 1.1, h: 0.09, fill: { color: MATCHA }, line: { color: MATCHA } })
      slide.addText(s.title, { x: 0.9, y: 2.8, w: 11.5, h: 1.6, fontFace: 'Georgia', fontSize: 44, bold: true, color: PAPER, valign: 'top', fit: 'shrink' })
      if (s.bullets.length) {
        slide.addText(s.bullets.join(' · '), { x: 0.9, y: 4.5, w: 11.5, h: 1.2, fontFace: 'Calibri', fontSize: 18, color: 'C9D3CF', valign: 'top', fit: 'shrink' })
      }
      slide.addText('Made with Sankshep.ai', { x: 0.9, y: 6.6, w: 6, h: 0.4, fontFace: 'Calibri', fontSize: 11, color: '9FB0AA' })
      return
    }

    slide.background = { color: PAPER }
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: LOGO_GREEN }, line: { color: LOGO_GREEN } })
    slide.addText(s.title, { x: 0.8, y: 0.5, w: 11.7, h: 1.0, fontFace: 'Georgia', fontSize: 32, bold: true, color: INK, valign: 'bottom', fit: 'shrink' })
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.62, w: 0.8, h: 0.06, fill: { color: MATCHA }, line: { color: MATCHA } })
    if (s.bullets.length) {
      slide.addText(
        s.bullets.map((b) => ({ text: b, options: { bullet: { indent: 18 }, paraSpaceAfter: 10 } })),
        { x: 0.8, y: 1.95, w: 11.7, h: 4.8, fontFace: 'Calibri', fontSize: 20, color: INK, valign: 'top', fit: 'shrink' },
      )
    }
    slide.addText(`${i + 1} / ${slides.length}`, { x: 11.3, y: 6.85, w: 1.2, h: 0.35, fontFace: 'Calibri', fontSize: 11, color: INK_MUTE, align: 'right' })
  })

  const blob = (await pptx.write({ outputType: 'blob' })) as Blob
  return new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
}
