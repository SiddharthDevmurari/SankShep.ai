/**
 * Image ingestion: turns an uploaded image into source text before the
 * pipeline runs, so every model (including text-only ones) can work from it.
 *
 * Preference order:
 *   1. a selected model that reads images and has a key
 *   2. any image-reading model from a provider the user gave a key for
 *   3. Tesseract OCR in the browser (text only; no API key, nothing uploaded)
 */

import { hasGroqKey } from './groq'
import { chat, hasKey, modelInfo, type ApiKeys, type ImageInput, type ModelRef } from './providers'

export type ImageReader = { method: 'vision'; ref: ModelRef } | { method: 'ocr' }

/** Vision models to borrow when none of the selected models reads images. */
const FALLBACK_VISION: ModelRef[] = [
  { provider: 'gemini', model: 'gemini-2.5-flash' },
  { provider: 'mistral', model: 'mistral-medium-latest' },
]

export function pickImageReader(selected: ModelRef[], keys: ApiKeys): ImageReader {
  const usable = (ref: ModelRef) => modelInfo(ref)?.kind === 'vision' && hasKey(ref.provider, keys, hasGroqKey)
  const ref = selected.find(usable) ?? FALLBACK_VISION.find(usable)
  return ref ? { method: 'vision', ref } : { method: 'ocr' }
}

const TRANSCRIBE_PROMPT =
  'You extract source material from images. First transcribe every piece of text in the image verbatim, keeping its structure: headings, lists, and tables as Markdown tables. Then, under a line "Visual content:", describe each chart, diagram or photo with the facts, numbers and trends it conveys. Output only the extracted material, no commentary.'

/**
 * Reads every image (an upload, or a scanned PDF's pages) into one source text.
 * Images go one at a time: vision calls stay under per-minute rate limits and
 * OCR reuses a single engine. Pages with nothing legible are skipped.
 */
export async function readImages(images: ImageInput[], reader: ImageReader, keys: ApiKeys): Promise<string> {
  const pages: string[] = []
  if (reader.method === 'vision') {
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
    }
  } else {
    // Loaded on demand: the OCR engine and English model download only when an image needs them.
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker('eng')
    try {
      for (const image of images) {
        const { data } = await worker.recognize(`data:${image.mimeType};base64,${image.data}`)
        pages.push(data.text.trim())
      }
    } finally {
      await worker.terminate()
    }
  }
  const text = pages.filter(Boolean).join('\n\n')
  if (!text) {
    throw new Error(
      reader.method === 'ocr'
        ? 'No readable text was found in the image. On-device OCR only reads printed text; to read charts, photos or handwriting, pick a Gemini or Mistral vision model and add its key.'
        : `${reader.ref.model} found nothing to read in the image.`,
    )
  }
  return text
}

export function describeReader(reader: ImageReader) {
  return reader.method === 'vision' ? reader.ref.model : 'on-device OCR'
}
