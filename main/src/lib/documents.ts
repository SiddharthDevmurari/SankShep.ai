/**
 * Document ingestion: turns an uploaded PDF or DOCX into plain text in the browser,
 * so the pipeline gets readable source text instead of the file's binary bytes.
 * A scanned PDF has no text layer, so its pages come back as images for the
 * pipeline's image reader (lib/ingest.ts). Nothing is uploaded; the parsers load
 * only when a document is dropped.
 */

import type { ImageInput } from './providers'

/** Pages of a scanned PDF sent to the image reader; each one is a model call or an OCR pass. */
export const MAX_SCANNED_PAGES = 10

export interface DocumentContent {
  text: string
  /** Page images of a scanned PDF, when it had no text to extract. */
  pageImages: ImageInput[]
  /** Pages the scanned PDF had in total, so the UI can say when only the first ones are read. */
  pageCount: number
}

export function isDocxFile(file: File) {
  return /\.docx$/i.test(file.name) || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

export function isPdfFile(file: File) {
  return /\.pdf$/i.test(file.name) || file.type === 'application/pdf'
}

export function isDocumentFile(file: File) {
  return isDocxFile(file) || isPdfFile(file)
}

/** Collapse runs of blank lines and trailing spaces left behind by the parsers. */
function tidy(text: string) {
  return text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

async function readDocx(file: File): Promise<string> {
  const { default: mammoth } = await import('mammoth')
  const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
  return value
}

async function readPdf(file: File): Promise<DocumentContent> {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
  const doc = await task.promise
  try {
    const pages: string[] = []
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n)
      const content = await page.getTextContent()
      // Text items carry their own line breaks (hasEOL); join them back into lines.
      pages.push(content.items.map((item) => ('str' in item ? item.str + (item.hasEOL ? '\n' : '') : '')).join(''))
      page.cleanup()
    }
    const text = tidy(pages.join('\n\n'))
    if (text) return { text, pageImages: [], pageCount: doc.numPages }

    // No text layer: a scan. Render the first pages so they can be read like uploaded images.
    const pageImages: ImageInput[] = []
    for (let n = 1; n <= Math.min(doc.numPages, MAX_SCANNED_PAGES); n++) {
      const page = await doc.getPage(n)
      // About 1600px on the long side keeps print legible for OCR and well under the 10 MB image limit.
      const base = page.getViewport({ scale: 1 })
      const viewport = page.getViewport({ scale: Math.min(2, 1600 / Math.max(base.width, base.height)) })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      await page.render({ canvas, viewport }).promise
      const url = canvas.toDataURL('image/jpeg', 0.85)
      pageImages.push({ mimeType: 'image/jpeg', data: url.slice(url.indexOf(',') + 1) })
      page.cleanup()
    }
    return { text: '', pageImages, pageCount: doc.numPages }
  } finally {
    void task.destroy()
  }
}

/** Extract the text of a PDF or DOCX (or a scanned PDF's page images). Throws with a message fit to show the user. */
export async function extractDocument(file: File): Promise<DocumentContent> {
  let result: DocumentContent
  try {
    result = isPdfFile(file) ? await readPdf(file) : { text: tidy(await readDocx(file)), pageImages: [], pageCount: 0 }
  } catch (err) {
    console.error('Document parse failed:', err)
    const name = err instanceof Error ? err.name : ''
    if (name === 'PasswordException') throw new Error(`“${file.name}” is password-protected. Remove the password and upload it again.`)
    throw new Error(`Couldn't read “${file.name}”. The file may be damaged, or not a real ${isPdfFile(file) ? 'PDF' : 'Word (.docx)'} file.`)
  }
  if (!result.text && result.pageImages.length === 0) {
    throw new Error(isPdfFile(file) ? `“${file.name}” has no pages to read.` : `“${file.name}” has no text in it.`)
  }
  return result
}
