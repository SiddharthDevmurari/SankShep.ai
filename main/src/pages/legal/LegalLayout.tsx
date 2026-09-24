import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SitePage } from '../../components/site/SiteChrome'

export interface LegalSection {
  id: string
  title: string
  body: ReactNode
}

/**
 * Reading layout shared by the Privacy Policy and the Terms: a plain-language
 * summary up top, a sticky contents list on wide screens, and one narrow column
 * of numbered sections.
 */
export function LegalLayout({ title, updated, summary, sections, sibling }: {
  title: string
  updated: string
  summary: ReactNode
  sections: LegalSection[]
  sibling: { label: string; to: string }
}) {
  const active = useActiveSection(sections.map((s) => s.id))

  return (
    <SitePage>
      <article className="mx-auto max-w-[1100px] px-5 pb-24 pt-14 sm:px-8 lg:pt-20">
        <header className="max-w-[68ch]">
          <p className="text-[13.5px] font-semibold text-ink-soft">Legal</p>
          <h1 className="font-headline mt-3 text-[clamp(3rem,7vw,5.25rem)] text-ink">{title}</h1>
          <p className="mt-5 font-mono text-[12.5px] text-ink-mute">Last updated {updated}</p>
        </header>

        <aside aria-label="Summary" className="mt-10 max-w-[68ch] rounded-2xl border border-hair bg-white p-6 sm:p-7">
          <h2 className="text-[13.5px] font-semibold text-ink">The short version</h2>
          <div className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink-soft [&_strong]:font-semibold [&_strong]:text-ink">{summary}</div>
        </aside>

        <div className="mt-14 grid gap-12 lg:grid-cols-[200px_minmax(0,68ch)] lg:gap-16">
          <nav aria-label="Contents" className="hidden lg:block">
            <div className="sticky top-32">
              <p className="text-[12.5px] font-semibold text-ink-mute">Contents</p>
              <ol className="mt-3 space-y-0.5 border-l border-hair">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={active === s.id ? 'location' : undefined}
                      className={`-ml-px flex gap-2.5 border-l py-1.5 pl-4 text-[13px] leading-snug transition-colors ${
                        active === s.id ? 'border-ink font-medium text-ink' : 'border-transparent text-ink-mute hover:text-ink'
                      }`}
                    >
                      <span className="font-mono text-[11.5px] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="min-w-0">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-32 border-t border-hair py-10 first:border-t-0 first:pt-0">
                <h2 id={`${s.id}-h`} className="flex items-baseline gap-4 font-display text-[clamp(1.5rem,2.4vw,1.9rem)] text-ink">
                  <span className="font-mono text-[13px] font-normal tracking-normal text-ink-mute tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                <div className="legal-prose mt-5">{s.body}</div>
              </section>
            ))}

            <footer className="mt-6 rounded-2xl bg-paper-deep p-6 text-[14.5px] leading-relaxed text-ink-soft">
              Read this together with our{' '}
              <Link to={sibling.to} className="font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">{sibling.label}</Link>.
            </footer>
          </div>
        </div>
      </article>
    </SitePage>
  )
}

/** The section currently nearest the top of the viewport, for the contents list. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  const key = ids.join('|')
  useEffect(() => {
    const els = key.split('|').map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -65% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [key])
  return active
}
