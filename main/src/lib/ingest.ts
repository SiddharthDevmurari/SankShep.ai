/**
 * Image ingestion: turns an uploaded image into source text before the
 * pipeline runs, so every model (including text-only ones) can work from it.
 *
 * Preference order:
 *   1. a selected model that reads images
 *   2. a Gemini or Mistral vision model (the user's key or the shared keys)
 *   3. Tesseract OCR in the browser (text only; no API key, nothing uploaded),
 *      also used when the vision model can't be reached
 */

import { chat, hasKey, modelInfo, type ApiKeys, type ImageInput, type ModelRef } from './providers'

export type ImageReader = { method: 'vision'; ref: ModelRef } | { method: 'ocr' }

/** Vision models to borrow when none of the selected models reads images. */
const FALLBACK_VISION: ModelRef[] = [
  // Flash-lite first: it answers when 3.8-flash is overloaded, and reads text in images well.
  { provider: 'gemini', model: 'gemini-3.5-flash-lite' },
  { provider: 'gemini', model: 'gemini-3.8-flash' },
  { provider: 'mistral', model: 'mistral-medium-latest' },
]

export function pickImageReader(selected: ModelRef[], keys: ApiKeys): ImageReader {
  const usable = (ref: ModelRef) => modelInfo(ref)?.kind === 'vision' && hasKey(ref.provider, keys)
  const ref = selected.find(usable) ?? FALLBACK_VISION.find(usable)
  return ref ? { method: 'vision', ref } : { method: 'ocr' }
}

const TRANSCRIBE_PROMPT =
  'You extract source material from images. First transcribe every piece of text in the image verbatim, keeping its structure: headings, lists, and tables as Markdown tables. Then, under a line "Visual content:", describe each chart, diagram or photo with the facts, numbers and trends it conveys. Output only the extracted material, no commentary.'

/**
 * Reads every image (an upload, or a scanned PDF's pages) into one source text.
 * Images go one at a time: vision calls stay under per-minute rate limits and
 * OCR reuses a single engine. Pages with nothing legible are skipped. If the
 * vision model can't be reached, on-device OCR reads the images instead.
 * Returns the text, the reader that actually produced it, and why the user's own key failed
 * when the shared keys read the image instead (see ChatResult.ownKeyFailure).
 */
export async function readImages(
  images: ImageInput[],
  reader: ImageReader,
  keys: ApiKeys,
): Promise<{ text: string; reader: ImageReader; ownKeyFailure?: string }> {
  if (reader.method === 'vision') {
    try {
      const pages: string[] = []
      let ownKeyFailure: string | undefined
      for (const image of images) {
        const result = await chat(
          reader.ref,
          [
            { role: 'system', content: TRANSCRIBE_PROMPT },
            { role: 'user', content: 'Extract the content of this image.', images: [image] },
          ],
          keys,
          { maxTokens: 4096, temperature: 0.1 },
        )
        pages.push(result.content.trim())
        ownKeyFailure ??= result.ownKeyFailure
      }
      const text = pages.filter(Boolean).join('\n\n')
      if (!text) throw new Error(`${reader.ref.model} found nothing to read in the image.`)
      return { text, reader, ownKeyFailure }
    } catch (err) {
      console.warn('[ingest] vision read failed, falling back to on-device OCR:', err)
    }
  }
  return { text: await ocr(images), reader: { method: 'ocr' } }
}

async function ocr(images: ImageInput[]): Promise<string> {
  // Loaded on demand: the OCR engine and English model download only when an image needs them.
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  const pages: string[] = []
  try {
    for (const image of images) {
      const { data } = await worker.recognize(`data:${image.mimeType};base64,${image.data}`)
      pages.push(data.text.trim())
    }
  } finally {
    await worker.terminate()
  }
  const text = pages.filter(Boolean).join('\n\n')
  if (!text) {
    throw new Error('No readable text was found in the image. On-device OCR only reads printed text; charts, photos and handwriting need a vision model (Gemini or Mistral).')
  }
  return text
}

export function describeReader(reader: ImageReader) {
  return reader.method === 'vision' ? reader.ref.model : 'on-device OCR'
}
