// The demo as data: what the mockup shows (DemoState) and the pointer's script (BEATS).
// The director (useDirector) plays the beats in order; seeking replays them instantly.
import { DEFAULT_MODEL, DEMO_MODEL, REFINE_PROMPT, type DraftId, type FormatId, type ModelChoice } from './content'

export interface DemoState {
  tab: 'transform' | 'history'
  /** Narrow layout only: the settings panel or the output canvas (the wide layout shows both). */
  pane: 'config' | 'canvas'
  /** The pointer is dragging the source file in. */
  carry: boolean
  file: 'none' | 'reading' | 'ready'
  formats: FormatId[]
  audienceOpen: boolean
  audience: string | null
  engineOpen: boolean
  modelMenu: boolean
  model: ModelChoice
  phase: 'idle' | 'generating' | 'done'
  draft: DraftId
  view: 'editor' | 'preview'
  refineFocus: boolean
  refineText: string
  refining: boolean
  refined: boolean
  downloadMenu: boolean
  downloadBusy: boolean
  filterMenu: boolean
  filter: FormatId | null
  drafts: number
  generatedAt: number | null
  /** The element under the pointer, and the one it is pressing: drive the mockup's hover and active looks. */
  hover: string | null
  press: string | null
}

export const INITIAL: DemoState = {
  tab: 'transform',
  pane: 'config',
  carry: false,
  file: 'none',
  formats: ['exec'],
  audienceOpen: false,
  audience: null,
  engineOpen: false,
  modelMenu: false,
  model: DEFAULT_MODEL,
  phase: 'idle',
  draft: 'exec',
  view: 'editor',
  refineFocus: false,
  refineText: '',
  refining: false,
  refined: false,
  downloadMenu: false,
  downloadBusy: false,
  filterMenu: false,
  filter: null,
  drafts: 0,
  generatedAt: null,
  hover: null,
  press: null,
}

type Patch = (s: DemoState) => Partial<DemoState>

export type Beat =
  /** Glide to the element marked data-demo={to}, scrolling its panel when it is out of view. `at` is the point inside it, as fractions. */
  | { t: 'move'; to: string; ms: number; at?: [number, number]; align?: 'top' }
  | { t: 'click'; apply?: Patch }
  | { t: 'wait'; ms: number }
  | { t: 'set'; apply: Patch }
  | { t: 'scroll'; area: 'config' | 'canvas'; to: number | 'end'; ms: number }
  | { t: 'type'; text: string; ms: number }
  | { t: 'cursor'; show: boolean }
  | { t: 'chapter'; n: number }

export const CLICK_MS = 240
export const CURSOR_FADE_MS = 300

const toggle = (id: FormatId): Patch => (s) => ({
  formats: s.formats.includes(id) ? s.formats.filter((f) => f !== id) : [...s.formats, id],
})

export const BEATS: Beat[] = [
  // 1. Add a source: drag the problem statement onto the drop zone.
  { t: 'chapter', n: 0 },
  { t: 'set', apply: () => ({ carry: true }) },
  { t: 'cursor', show: true },
  { t: 'move', to: 'dropzone', ms: 1100, at: [0.5, 0.45] },
  { t: 'wait', ms: 450 },
  { t: 'click', apply: () => ({ carry: false, file: 'reading' }) },
  { t: 'wait', ms: 900 },
  { t: 'set', apply: () => ({ file: 'ready' }) },
  { t: 'wait', ms: 500 },

  // 2. Pick formats. Executive Summary starts selected, as it does in the workspace.
  { t: 'chapter', n: 1 },
  { t: 'move', to: 'fmt-linkedin', ms: 900 },
  { t: 'click', apply: toggle('linkedin') },
  { t: 'move', to: 'fmt-deck', ms: 550 },
  { t: 'click', apply: toggle('deck') },
  { t: 'wait', ms: 450 },

  // 3. Audience and model: two folded steps and the model dropdown.
  { t: 'chapter', n: 2 },
  { t: 'move', to: 'audience-toggle', ms: 800, at: [0.3, 0.5], align: 'top' },
  { t: 'click', apply: () => ({ audienceOpen: true }) },
  { t: 'move', to: 'aud-manager', ms: 550 },
  { t: 'click', apply: () => ({ audience: 'Manager/Executive' }) },
  { t: 'wait', ms: 300 },
  { t: 'move', to: 'engine-toggle', ms: 750, at: [0.3, 0.5], align: 'top' },
  { t: 'click', apply: () => ({ engineOpen: true }) },
  { t: 'move', to: 'model-select', ms: 550, at: [0.35, 0.5] },
  { t: 'click', apply: () => ({ modelMenu: true }) },
  { t: 'move', to: 'model-gemini-3.8-flash', ms: 750, at: [0.35, 0.5] },
  { t: 'wait', ms: 250 },
  { t: 'click', apply: () => ({ model: DEMO_MODEL, modelMenu: false }) },
  { t: 'wait', ms: 500 },

  // 4. Generate.
  { t: 'chapter', n: 3 },
  { t: 'move', to: 'generate', ms: 850, at: [0.45, 0.5] },
  { t: 'wait', ms: 200 },
  { t: 'click', apply: () => ({ phase: 'generating', pane: 'canvas' }) },
  { t: 'wait', ms: 2600 },
  { t: 'set', apply: (s) => ({ phase: 'done', draft: 'exec', drafts: s.drafts + 3, generatedAt: Date.now() }) },
  { t: 'wait', ms: 600 },

  // 5. Read, refine the LinkedIn post, preview it.
  { t: 'chapter', n: 4 },
  { t: 'move', to: 'draft-body', ms: 800, at: [0.6, 0.3] },
  { t: 'scroll', area: 'canvas', to: 'end', ms: 1800 },
  { t: 'wait', ms: 400 },
  { t: 'scroll', area: 'canvas', to: 0, ms: 700 },
  { t: 'move', to: 'tab-linkedin', ms: 750 },
  { t: 'click', apply: () => ({ draft: 'linkedin' }) },
  { t: 'wait', ms: 500 },
  // Clicks the right side of the box, so the pointer doesn't sit on the words it types.
  { t: 'move', to: 'refine-input', ms: 750, at: [0.75, 0.5] },
  { t: 'click', apply: () => ({ refineFocus: true }) },
  { t: 'type', text: REFINE_PROMPT, ms: 1300 },
  { t: 'move', to: 'refine-submit', ms: 450 },
  { t: 'click', apply: () => ({ refining: true }) },
  { t: 'wait', ms: 1500 },
  { t: 'set', apply: () => ({ refining: false, refined: true, refineText: '', refineFocus: false }) },
  { t: 'wait', ms: 400 },
  { t: 'move', to: 'view-preview', ms: 700 },
  { t: 'click', apply: () => ({ view: 'preview' }) },
  { t: 'wait', ms: 1500 },

  // 6. Export the deck.
  { t: 'chapter', n: 5 },
  { t: 'move', to: 'tab-deck', ms: 700 },
  { t: 'click', apply: () => ({ draft: 'deck' }) },
  { t: 'wait', ms: 700 },
  { t: 'move', to: 'download', ms: 650 },
  { t: 'click', apply: () => ({ downloadMenu: true }) },
  { t: 'move', to: 'dl-pptx', ms: 500, at: [0.35, 0.5] },
  { t: 'wait', ms: 200 },
  { t: 'click', apply: () => ({ downloadBusy: true }) },
  { t: 'wait', ms: 900 },
  { t: 'set', apply: () => ({ downloadBusy: false, downloadMenu: false }) },
  { t: 'wait', ms: 500 },

  // 7. History: switch tabs, filter by format, come back.
  { t: 'chapter', n: 6 },
  { t: 'move', to: 'ws-tab-history', ms: 900 },
  { t: 'click', apply: () => ({ tab: 'history' }) },
  { t: 'wait', ms: 800 },
  { t: 'move', to: 'history-filter', ms: 750, at: [0.4, 0.5] },
  { t: 'click', apply: () => ({ filterMenu: true }) },
  { t: 'move', to: 'filter-deck', ms: 600, at: [0.3, 0.5] },
  { t: 'click', apply: () => ({ filter: 'deck', filterMenu: false }) },
  { t: 'wait', ms: 700 },
  { t: 'move', to: 'history-row-deck', ms: 600, at: [0.25, 0.5] },
  { t: 'wait', ms: 1000 },
  { t: 'move', to: 'ws-tab-transform', ms: 900 },
  { t: 'click', apply: () => ({ tab: 'transform' }) },
  { t: 'wait', ms: 1600 },
  { t: 'cursor', show: false },
  { t: 'wait', ms: 500 },
]

export const beatMs = (b: Beat) =>
  b.t === 'move' || b.t === 'wait' || b.t === 'scroll' || b.t === 'type' ? b.ms
    : b.t === 'click' ? CLICK_MS
      : b.t === 'cursor' ? CURSOR_FADE_MS
        : 0

/** When each beat starts on the timeline, and the total length. */
export const BEAT_START: number[] = []
let clock = 0
for (const b of BEATS) {
  BEAT_START.push(clock)
  clock += beatMs(b)
}
export const TOTAL_MS = clock

/** Each chapter's first beat, and its span on the timeline. */
export const CHAPTERS = BEATS.flatMap((b, i) => (b.t === 'chapter' ? [{ n: b.n, beat: i, start: BEAT_START[i] }] : []))
  .map((c, i, all) => ({ ...c, end: all[i + 1]?.start ?? TOTAL_MS }))
