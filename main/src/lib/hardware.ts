/**
 * Can this computer run the on-device engine (qwen2.5vl:7b through Ollama)? Judged from what the
 * browser exposes: memory, logical cores and the GPU name.
 *
 * All of it is approximate. navigator.deviceMemory is rounded down to a power of two (and missing in
 * Firefox and Safari); Safari hides the GPU's name; and laptops with two graphics chips often show the
 * browser only the integrated one, even when Ollama runs on the dedicated one. So the verdict has a
 * third state, `unverified`, and the UI lets the user set Private mode up anyway.
 */

export type GpuKind = 'dedicated' | 'apple' | 'integrated' | 'unknown'

export interface GpuInfo {
  /** A readable name ("NVIDIA GeForce RTX 3050 Laptop GPU"), or null when the browser hides it. */
  name: string | null
  kind: GpuKind
}

export interface HardwareReport {
  /** GB, as the browser reports it (rounded down to a power of two); null when it isn't shared. */
  ramGb: number | null
  /** Logical cores; null when it isn't shared. */
  cores: number | null
  gpu: GpuInfo
  /** A phone or tablet: Ollama doesn't run there at all. */
  mobile: boolean
  isCapable: boolean
  verdict: 'capable' | 'insufficient' | 'unverified'
  /** What decided it. */
  reason: 'gpu' | 'cpu-ram' | 'mobile' | 'low-ram' | 'weak' | 'unknown'
}

/** qwen2.5vl:7b is about 6 GB on disk and in memory; the system and browser need room beside it. */
export const MIN_RAM_GB = 8
export const MIN_CORES = 6

const GPU_TIMEOUT_MS = 1_500

/** Decides the verdict from the raw readings; separate from the browser calls so it can be tested. */
export function classifyHardware(input: { ramGb: number | null; cores: number | null; gpu: GpuInfo; mobile: boolean }): HardwareReport {
  const { ramGb, cores, gpu, mobile } = input
  const report = (verdict: HardwareReport['verdict'], reason: HardwareReport['reason']): HardwareReport => ({
    ...input,
    verdict,
    reason,
    isCapable: verdict === 'capable',
  })

  if (mobile) return report('insufficient', 'mobile')
  if (ramGb !== null && ramGb < MIN_RAM_GB) return report('insufficient', 'low-ram')
  if (gpu.kind === 'dedicated' || gpu.kind === 'apple') return report('capable', 'gpu')
  if (ramGb !== null && cores !== null && ramGb >= MIN_RAM_GB && cores >= MIN_CORES) return report('capable', 'cpu-ram')
  // Integrated graphics and too few cores: the one weak combination the browser can confirm.
  if (gpu.kind === 'integrated' && cores !== null && cores < MIN_CORES) return report('insufficient', 'weak')
  return report('unverified', 'unknown')
}

/**
 * Sorts a GPU name into dedicated, Apple Silicon or integrated. AMD and Intel make both kinds, so
 * only their discrete lines count as dedicated (Radeon RX / Pro / VII, Intel Arc A- and B-series).
 */
export function classifyGpu(raw: string | null | undefined): GpuInfo {
  const name = raw ? cleanGpuName(raw) : null
  if (!name) return { name: null, kind: 'unknown' }
  // Software renderers mean hardware acceleration is off: the real GPU is unknown.
  if (/swiftshader|llvmpipe|softpipe|basic render|microsoft basic|software/i.test(name)) return { name: null, kind: 'unknown' }
  if (/nvidia|geforce|quadro|tesla|\brtx\b|\bgtx\b/i.test(name)) return { name, kind: 'dedicated' }
  if (/radeon\s*(rx|pro|vii|r9|r7)\b|\brx\s?\d{3,4}/i.test(name)) return { name, kind: 'dedicated' }
  if (/\barc\s*(a|b)\d{3}/i.test(name)) return { name, kind: 'dedicated' }
  // Safari calls every Mac GPU "Apple GPU", Intel Macs included, so only a named M-series chip counts.
  if (/apple\s*m\d/i.test(name)) return { name, kind: 'apple' }
  if (/intel|radeon|amd|adreno|mali|powervr|vega/i.test(name)) return { name, kind: 'integrated' }
  return { name, kind: 'unknown' }
}

/**
 * "ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 Laptop GPU (0x000025A2) Direct3D11 vs_5_0 ps_5_0, D3D11)"
 * → "NVIDIA GeForce RTX 3050 Laptop GPU". Also drops ™/® marks and Metal's "ANGLE Metal Renderer:" prefix.
 */
function cleanGpuName(raw: string): string {
  let s = raw.trim()
  const angle = /^ANGLE \((.*)\)$/.exec(s)
  if (angle) {
    const parts = angle[1].split(', ')
    s = parts.length > 1 ? parts[1] : parts[0]
  }
  return s
    .replace(/^ANGLE Metal Renderer:\s*/i, '')
    .replace(/\s*\(0x[0-9a-f]+\)/gi, '')
    .replace(/\s+(Direct3D|D3D|OpenGL|Vulkan|Metal)\w*.*$/i, '')
    .replace(/\((TM|R)\)/gi, '')
    .replace(/,?\s*Unspecified Version$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function isMobileDevice(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  if (nav.userAgentData?.mobile) return true
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) return true
  // iPadOS reports itself as a Mac; a touch screen gives it away.
  return /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1
}

function webglRenderer(): string | null {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')
    if (!(gl instanceof WebGLRenderingContext)) return null
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER)
    gl.getExtension('WEBGL_lose_context')?.loseContext() // Free the context now rather than at garbage collection.
    return typeof renderer === 'string' ? renderer : null
  } catch {
    return null
  }
}

/**
 * WebGPU's high-performance adapter can name a GPU WebGL doesn't use (on some two-GPU laptops).
 * It reports a vendor and architecture rather than a model name.
 */
async function webgpuAdapter(): Promise<{ vendor: string; architecture: string } | null> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(o?: object): Promise<{ info?: { vendor?: string; architecture?: string } } | null> } }).gpu
  if (!gpu) return null
  try {
    const adapter = await Promise.race([
      gpu.requestAdapter({ powerPreference: 'high-performance' }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), GPU_TIMEOUT_MS)),
    ])
    const info = adapter?.info
    return info?.vendor ? { vendor: info.vendor, architecture: info.architecture ?? '' } : null
  } catch {
    return null
  }
}

async function detectGpu(): Promise<GpuInfo> {
  const fromWebgl = classifyGpu(webglRenderer())
  if (fromWebgl.kind === 'dedicated' || fromWebgl.kind === 'apple') return fromWebgl
  // NVIDIA only makes dedicated GPUs, so the vendor alone settles it; AMD and Intel don't.
  const adapter = await webgpuAdapter()
  if (adapter?.vendor === 'nvidia') {
    const arch = adapter.architecture ? ` (${adapter.architecture.replace(/-/g, ' ')})` : ''
    return { name: `NVIDIA GPU${arch}`, kind: 'dedicated' }
  }
  return fromWebgl
}

let pending: Promise<HardwareReport> | null = null

/** Reads this device once per page load; later calls share the answer. */
export function checkLocalHardwareCompatibility(): Promise<HardwareReport> {
  pending ??= (async () => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    const ramGb = typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0 ? nav.deviceMemory : null
    const cores = navigator.hardwareConcurrency > 0 ? navigator.hardwareConcurrency : null
    return classifyHardware({ ramGb, cores, gpu: await detectGpu(), mobile: isMobileDevice() })
  })()
  return pending
}
