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
  { provider: 'mistral', model: 'pixtral-large-latest' },
]

export function pickImageReader(selected: ModelRef[], keys: ApiKeys): ImageReader {
  const usable = (ref: ModelRef) => modelInfo(ref)?.kind === 'vision' && hasKey(ref.provider, keys, hasGroqKey)
  const ref = selected.find(usable) ?? FALLBACK_VISION.find(usable)
  return ref ? { method: 'vision', ref } : { method: 'ocr' }
}

const TRANSCRIBE_PROMPT =
  'You extract source material from images. First transcribe every piece of text in the image verbatim, keeping its structure: headings, lists, and tables as Markdown tables. Then, under a line "Visual content:", describe each chart, diagram or photo with the facts, numbers and trends it conveys. Output only the extracted material, no commentary.'

export async function readImage(image: ImageInput, reader: ImageReader, keys: ApiKeys): Promise<string> {
  if (reader.method === 'vision') {
    const result = await chat(
      reader.ref,
      [
        { role: 'system', content: TRANSCRIBE_PROMPT },
        { role: 'user', content: 'Extract the content of this image.', images: [image] },
      ],
      keys,
      { maxTokens: 4096, temperature: 0.1 },
    )
    return result.content.trim()
  }

  // Loaded on demand: the OCR engine and English model download only when an image needs them.
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  try {
    const { data } = await worker.recognize(`data:${image.mimeType};base64,${image.data}`)
    const text = data.text.trim()
    if (!text) {
      throw new Error(
        'No readable text was found in the image. On-device OCR only reads printed text; to read charts or photos, pick a Gemini or Mistral vision model and add its key.',
      )
    }
    return text
  } finally {
    await worker.terminate()
  }
}

export function describeReader(reader: ImageReader) {
  return reader.method === 'vision' ? reader.ref.model : 'on-device OCR'
}
