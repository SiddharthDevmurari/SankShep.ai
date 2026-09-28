import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, ChevronDown, Cloud, Copy, HardDrive, Lock, RefreshCw } from 'lucide-react'
import { detectOllama, LOCAL_NUM_CTX, LOCAL_TEMPERATURE, OLLAMA_URL, PREFERRED_LOCAL_MODEL, type LocalStatus } from '../lib/local'

/** Where drafts are written: the cloud providers, or the user's own machine through Ollama. */
export type ProcessingMode = 'cloud' | 'local'

const MODE_KEY = 'sankshep:processing-mode'

/** The mode chosen last time on this browser; Private mode is a standing decision for the people who pick it. */
export function storedProcessingMode(): ProcessingMode {
  try {
    return localStorage.getItem(MODE_KEY) === 'local' ? 'local' : 'cloud'
  } catch {
    return 'cloud'
  }
}

export function storeProcessingMode(mode: ProcessingMode) {
  try {
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    // Storage blocked (private window, site data off): the choice lasts for this visit only.
  }
}

/* ─── Connection ────────────────────────────────────────────────────────── */

/** Unready engines are checked again this often, so finishing setup in a terminal shows up without a click. */
const RECHECK_MS = 10_000

/**
 * Watches the local Ollama while Private mode is on: checks when it turns on, whenever the tab
 * regains focus, and every few seconds until the engine is ready. A re-check keeps showing the
 * last answer (with `checking` set) rather than flashing back to a loading state.
 */
export function useLocalEngine(active: boolean) {
  const [status, setStatus] = useState<LocalStatus>({ state: 'checking' })
  const [checking, setChecking] = useState(false)
  const seq = useRef(0)

  const refresh = useCallback(async () => {
    const id = ++seq.current
    setChecking(true)
    const next = await detectOllama()
    // A newer check started meanwhile; its answer is the one to show.
    if (id !== seq.current) return
    setStatus(next)
    setChecking(false)
  }, [])

  useEffect(() => {
    if (active) void refresh()
  }, [active, refresh])

  const ready = status.state === 'ready'
  useEffect(() => {
    if (!active) return
    const onReturn = () => { if (document.visibilityState === 'visible') void refresh() }
    window.addEventListener('focus', onReturn)
    document.addEventListener('visibilitychange', onReturn)
    const timer = ready ? undefined : setInterval(onReturn, RECHECK_MS)
    return () => {
      window.removeEventListener('focus', onReturn)
      document.removeEventListener('visibilitychange', onReturn)
      clearInterval(timer)
    }
  }, [active, ready, refresh])

  return { status, checking, refresh }
}

/* ─── Mode switch ───────────────────────────────────────────────────────── */

const MODES: { id: ProcessingMode; label: string; note: string; icon: typeof Cloud }[] = [
  { id: 'cloud', label: 'Cloud APIs', note: 'Fast', icon: Cloud },
  { id: 'local', label: 'Private', note: 'On-device', icon: Lock },
]

export function ProcessingModeSwitch({ mode, onChange, disabled }: {
  mode: ProcessingMode
  onChange: (mode: ProcessingMode) => void
  /** Locked while a run is in flight: the run keeps the engine it started on. */
  disabled?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Processing mode"
      title={disabled ? 'Stop or finish the current run to switch' : undefined}
      className="grid grid-cols-2 gap-1 rounded-full border border-line bg-white p-1"
    >
      {MODES.map(({ id, label, note, icon: Icon }) => {
        const active = mode === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled && !active}
            onClick={() => onChange(id)}
            className={`flex h-10 min-w-0 items-center justify-center gap-2 rounded-full px-3 text-[13.5px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 disabled:cursor-not-allowed disabled:opacity-50 ${
              active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-matcha' : ''}`} strokeWidth={1.8} aria-hidden />
            <span className="truncate">{label}</span>
            <span className={`hidden truncate text-[12px] font-normal min-[440px]:inline ${active ? 'text-paper/65' : 'text-ink-mute'}`}>{note}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ─── Status and setup ──────────────────────────────────────────────────── */

type Os = 'windows' | 'mac' | 'linux'

function detectOs(): Os {
  if (typeof navigator === 'undefined') return 'windows'
  if (/Mac|iPhone|iPad/.test(navigator.platform)) return 'mac'
  if (/Linux|X11/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent)) return 'linux'
  return 'windows'
}

/** Ollama lets localhost pages in by default; any other address has to be added to OLLAMA_ORIGINS. */
function onLocalhost() {
  return typeof location !== 'undefined' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)
}

/** Safari won't let an https page reach http://localhost at all, whatever Ollama allows. */
function safariBlocksLocalhost() {
  if (typeof navigator === 'undefined' || typeof location === 'undefined') return false
  return location.protocol === 'https:' && /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent)
}

/**
 * The status under the mode switch: one quiet line once the engine is ready, otherwise the setup
 * steps for whatever is missing, with the step the user is on picked out.
 */
export function LocalEngineStatus({ status, checking, model, onRefresh }: {
  status: LocalStatus
  checking: boolean
  model: string
  onRefresh: () => void
}) {
  if (status.state === 'checking') {
    return (
      <p className="flex items-center gap-2.5 text-[13px] text-ink-mute" aria-live="polite">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/15 border-t-ink/60" aria-hidden />
        Looking for Ollama on this device…
      </p>
    )
  }

  if (status.state === 'ready') {
    return (
      <div className="sk-rise" aria-live="polite">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-600" aria-hidden />
          <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">
            Local engine ready <span className="font-normal text-ink-mute">·</span>{' '}
            <span className="font-mono text-[12.5px] font-medium">{model}</span>
          </p>
          <RefreshButton checking={checking} onRefresh={onRefresh} compact />
        </div>
        <p className="mt-1 pl-[18px] text-[12.5px] leading-snug text-ink-mute">
          Your source and drafts stay on this device. History keeps only counts and the model name.
        </p>
      </div>
    )
  }

  return <SetupCard status={status} checking={checking} onRefresh={onRefresh} />
}

function SetupCard({ status, checking, onRefresh }: {
  status: Extract<LocalStatus, { state: 'offline' | 'blocked' | 'missing-model' }>
  checking: boolean
  onRefresh: () => void
}) {
  const [os, setOs] = useState<Os>(detectOs)
  const origin = typeof location !== 'undefined' ? location.origin : 'https://your-site'
  const localhost = onLocalhost()

  // What the check proved: a model list means Ollama runs and lets this page in; a refusal means it runs.
  const running = status.state !== 'offline'
  const originOk = status.state === 'missing-model' || (localhost && status.state !== 'blocked')
  const current = !running ? 1 : status.state === 'blocked' ? 3 : 2

  const heading = {
    offline: 'Ollama isn’t running on this device',
    blocked: 'Ollama is running, but it blocks this site',
    'missing-model': 'Ollama is running. The model isn’t installed yet',
  }[status.state]

  const intro = {
    offline: `Private mode writes your drafts with ${PREFERRED_LOCAL_MODEL} on your own computer, through Ollama. Setup takes a few minutes, once.`,
    blocked: 'Ollama only answers the websites it has been told to trust. Add this one, then restart Ollama.',
    'missing-model': 'Download the model once. It’s about 6 GB, and it stays on your computer.',
  }[status.state]

  const originCommand = {
    windows: `setx OLLAMA_ORIGINS "${origin}"`,
    mac: `launchctl setenv OLLAMA_ORIGINS "${origin}"`,
    linux: `OLLAMA_ORIGINS="${origin}" ollama serve`,
  }[os]
  const originAfter = {
    windows: 'Then quit Ollama from the system tray and open it again.',
    mac: 'Then quit Ollama from the menu bar and open it again.',
    linux: 'Run it in place of the Ollama service (sudo systemctl stop ollama first).',
  }[os]

  const others = status.state === 'missing-model' ? status.installed : []

  return (
    <section aria-labelledby="local-setup-title" className="sk-rise overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-deep text-ink ring-1 ring-hair" aria-hidden>
          <HardDrive className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <h3 id="local-setup-title" className="text-[14px] font-semibold leading-snug text-ink">{heading}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-mute">{intro}</p>
        </div>
      </div>

      <ol className="space-y-3.5 border-t border-hair px-4 py-4">
        <SetupStep n={1} state={running ? 'done' : 'current'} title={running ? 'Ollama is installed and running' : 'Install Ollama and open it'}>
          {!running && (
            <a
              href="https://ollama.com/download"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-1 text-[13px] font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              ollama.com/download <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          {!running && (
            <p className="text-[12.5px] leading-snug text-ink-mute">Already installed? Open the Ollama app so it runs in the background.</p>
          )}
        </SetupStep>

        <SetupStep n={2} state={current === 2 ? 'current' : 'todo'} title={`Download ${PREFERRED_LOCAL_MODEL}`}>
          <CodeLine command={`ollama pull ${PREFERRED_LOCAL_MODEL}`} />
          {others.length > 0 && (
            <p className="text-[12.5px] leading-snug text-ink-mute">
              Installed now: <span className="font-mono text-[12px] text-ink-soft">{others.slice(0, 4).join(', ')}{others.length > 4 ? ` +${others.length - 4}` : ''}</span>.
              Private mode needs a Qwen 2.5 model.
            </p>
          )}
        </SetupStep>

        <SetupStep
          n={3}
          state={originOk ? 'done' : current === 3 ? 'current' : 'todo'}
          title={originOk ? (localhost && status.state !== 'missing-model' ? 'Not needed on localhost' : 'This site can reach Ollama') : 'Let this site reach Ollama'}
        >
          {!originOk && (
            <>
              <div role="tablist" aria-label="Your operating system" className="inline-grid grid-cols-3 gap-0.5 rounded-lg bg-paper-deep p-0.5">
                {([['windows', 'Windows'], ['mac', 'macOS'], ['linux', 'Linux']] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={os === id}
                    onClick={() => setOs(id)}
                    className={`h-8 rounded-md px-2.5 text-[12.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                      os === id ? 'bg-white text-ink shadow-[0_0_0_1px_rgba(231,228,217,0.9)]' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <CodeLine command={originCommand} />
              <p className="text-[12.5px] leading-snug text-ink-mute">
                {originAfter} Naming this site, rather than <span className="font-mono text-[12px]">*</span>, keeps other websites from using your models.
              </p>
            </>
          )}
        </SetupStep>
      </ol>

      {(safariBlocksLocalhost() || status.state === 'offline') && (
        <p className="border-t border-hair bg-paper px-4 py-2.5 text-[12.5px] leading-snug text-ink-soft">
          {safariBlocksLocalhost()
            ? 'Safari doesn’t let secure websites reach apps on your computer. Use Chrome, Edge or Firefox for Private mode.'
            : 'If your browser asks whether this site may reach apps on your device, choose Allow.'}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hair bg-paper px-4 py-3">
        <RefreshButton checking={checking} onRefresh={onRefresh} />
        <span className="text-[12px] text-ink-mute">Checks {OLLAMA_URL.replace('http://', '')} again on its own every few seconds.</span>
      </div>
    </section>
  )
}

function SetupStep({ n, state, title, children }: {
  n: number
  state: 'done' | 'current' | 'todo'
  title: string
  children?: React.ReactNode
}) {
  return (
    <li className="flex gap-3" aria-current={state === 'current' ? 'step' : undefined}>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11.5px] font-semibold tabular-nums ${
          state === 'done' ? 'bg-paper-deep text-ink-soft ring-1 ring-hair' : state === 'current' ? 'bg-ink text-matcha' : 'bg-white text-ink-mute ring-1 ring-line'
        }`}
      >
        {state === 'done' ? <Check className="h-3.5 w-3.5" aria-label="Done" /> : n}
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className={`text-[13.5px] leading-6 ${state === 'done' ? 'text-ink-mute' : 'font-semibold text-ink'}`}>{title}</p>
        {children}
      </div>
    </li>
  )
}

function CodeLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
    } catch {
      return // The clipboard refused; the command is selectable as plain text.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="flex items-center rounded-lg border border-line bg-paper-deep/70">
      <code className="no-scrollbar min-w-0 flex-1 select-all overflow-x-auto whitespace-nowrap px-3 py-2 font-mono text-[12.5px] text-ink">{command}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : `Copy: ${command}`}
        title={copied ? 'Copied' : 'Copy'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-r-lg text-ink-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/30"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

function RefreshButton({ checking, onRefresh, compact }: { checking: boolean; onRefresh: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onRefresh}
        disabled={checking}
        aria-label="Check the local engine again"
        title="Check again"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 disabled:cursor-wait"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={checking}
      className="flex min-h-10 items-center gap-2 rounded-lg bg-ink px-3.5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha disabled:cursor-wait"
    >
      <RefreshCw className={`h-4 w-4 text-matcha ${checking ? 'animate-spin' : ''}`} aria-hidden />
      {checking ? 'Checking…' : 'Refresh connection'}
    </button>
  )
}

/* ─── Engine step (Private mode) ────────────────────────────────────────── */

/** Step 05's body in Private mode: which installed model writes, and what the engine does with the source. */
export function LocalEngineDetails({ status, model, onModelChange }: {
  status: LocalStatus
  model: string
  onModelChange: (model: string) => void
}) {
  const models = status.state === 'ready' ? status.models : []
  const rows: [string, string][] = [
    ['Context window', `${LOCAL_NUM_CTX.toLocaleString('en-US')} tokens, sized for 8 GB GPUs`],
    ['Temperature', `${LOCAL_TEMPERATURE}, close to the source`],
    ['Drafting', 'One format at a time, streamed as it’s written'],
    ['Images and scans', 'Read with on-device OCR, then sent as text'],
    ['Links', 'Off: they’re fetched by a cloud service'],
  ]

  return (
    <div className="sk-rise space-y-3">
      {models.length > 1 ? (
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-ink">Local model</span>
          <span className="relative flex items-center">
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-lg border border-line bg-white pl-3.5 pr-10 font-mono text-[13px] text-ink transition-colors hover:border-ink/40 focus-visible:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
            >
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-ink-mute" />
          </span>
        </label>
      ) : (
        <p className="text-[13px] text-ink-soft">
          Model <span className="ml-1 rounded-md bg-paper-deep px-1.5 py-0.5 font-mono text-[12.5px] text-ink">{model}</span>
          {status.state !== 'ready' && <span className="ml-2 text-ink-mute">once it’s installed</span>}
        </p>
      )}
      <dl className="divide-y divide-hair rounded-lg border border-line bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 px-3 py-2">
            <dt className="shrink-0 text-[12.5px] text-ink-mute">{label}</dt>
            <dd className="text-right text-[12.5px] font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
