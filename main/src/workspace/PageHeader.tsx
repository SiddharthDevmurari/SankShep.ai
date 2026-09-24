import type { ReactNode } from 'react'

/** Shared header for the workspace's reading pages: serif title and subtext left, actions right. */
export function PageHeader({ eyebrow, title, subtitle, actions }: {
  eyebrow: string
  title: string
  subtitle: string
  actions?: ReactNode
}) {
  return (
    <header className="grid gap-6 border-b border-ink/10 pb-8 pt-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12 lg:pb-10 lg:pt-12">
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold text-ink-soft">
          {eyebrow}
        </p>
        <h1 className="font-headline mt-2 text-[clamp(3rem,6vw,5rem)] text-ink">{title}</h1>
        <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-ink-mute">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">{actions}</div>}
    </header>
  )
}

/** Width and gutters shared with the Transform view, so switching tabs doesn't shift the page edges. */
export const PAGE_FRAME = 'mx-auto max-w-[1760px] px-4 pb-16 sm:px-6 lg:px-10 2xl:px-14'
