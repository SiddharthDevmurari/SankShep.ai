import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

/**
 * Compact toolbar for every workspace tab: breadcrumb and a small title left, actions right.
 * Kept short on purpose so the windows below get the screen, not the heading.
 */
export function PageHeader({ eyebrow, title, subtitle, actions }: {
  eyebrow: string
  title: string
  subtitle: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-ink/10 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-[12.5px] text-ink-mute">
          <span>Workspace</span>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="font-medium text-ink-soft">{eyebrow}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h1 className="text-[20px] font-semibold tracking-[-0.015em] text-ink">{title}</h1>
          <p className="text-[13.5px] text-ink-mute">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">{actions}</div>}
    </header>
  )
}

/** Width and gutters shared with the Transform view, so switching tabs doesn't shift the page edges. */
export const PAGE_FRAME = 'mx-auto max-w-[1760px] px-4 pb-16 sm:px-6 lg:px-10 2xl:px-14'
