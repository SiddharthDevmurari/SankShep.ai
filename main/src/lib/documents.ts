/**
 * Document ingestion: turns an uploaded PDF or DOCX into plain text in the browser,
 * so the pipeline gets readable source text instead of the file's binary bytes.
 * Nothing is uploaded; both parsers are loaded only when a document is dropped.
 */

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

async function readPdf(file: File): Promise<string> {
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
    return pages.join('\n\n')
  } finally {
    void task.destroy()
  }
}

/** Extract the text of a PDF or DOCX. Throws with a message fit to show the user. */
export async function extractDocumentText(file: File): Promise<string> {
  let text: string
  try {
    text = tidy(isPdfFile(file) ? await readPdf(file) : await readDocx(file))
  } catch (err) {
    console.error('Document parse failed:', err)
    const name = err instanceof Error ? err.name : ''
    if (name === 'PasswordException') throw new Error(`“${file.name}” is password-protected. Remove the password and upload it again.`)
    throw new Error(`Couldn't read “${file.name}”. The file may be damaged, or not a real ${isPdfFile(file) ? 'PDF' : 'Word (.docx)'} file.`)
  }
  if (!text) {
    throw new Error(
      isPdfFile(file)
        ? `“${file.name}” has no selectable text. It looks like a scan. Upload the pages as images so they can be read, or paste the text.`
        : `“${file.name}” has no text in it.`,
    )
  }
  return text
}
