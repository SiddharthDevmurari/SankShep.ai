// Marketing-site nav and footer, shared by the landing page and the static pages
// (Features, About, How it works, Privacy Policy, Terms and Conditions).
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import logoUrl from '../../assets/logo.jpeg'

export const GITHUB_URL = 'https://github.com/SiddharthDevmurari/SankShep.ai.git'

// Inline GitHub mark: lucide-react 1.x doesn't export Github
export const GithubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c.997.005 2.0.138 2.962.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

export const ArrowRight = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

// Pass size and radius together, e.g. "h-9 w-9 rounded-full"
export const BrandMark = ({ className = 'h-9 w-9 rounded-xl' }: { className?: string }) => (
  <img src={logoUrl} alt="" aria-hidden className={`${className} shrink-0 bg-[#213833] object-cover`} />
)

// Double-border highlight shared by every capsule: hair ring, ink ring, hair ring, soft drop shadow
export const CAPSULE_SHADOW = '0 0 0 1px #e7e4d9, 0 0 0 3px #0f100f, 0 0 0 5px #e7e4d9, 0 4px 24px -6px rgba(15,16,15,0.14)'

const NAV_LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'T&C', to: '/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
]

const PILL_LINK = 'rounded-full px-4 py-2 text-[14px] text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'

const MENU_LINK = 'flex min-h-12 items-center rounded-2xl px-4 text-[16px] font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'

export function SiteNav() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // Below xl the page links live in a menu behind the three-line button, so phones reach every page from the top.
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // A new page closes the menu.
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Escape (focus back on the button) or a tap outside the nav closes it.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    const onDown = (e: PointerEvent) => { if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [menuOpen])

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 px-4 pb-3 pt-5">
      <div className="flex justify-center">
        <nav
          aria-label="Main"
          className="flex max-w-full items-center gap-1.5 rounded-full bg-white/95 px-3 py-3 backdrop-blur-md sm:gap-3 sm:px-5"
          style={{ boxShadow: CAPSULE_SHADOW }}
        >
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 xl:hidden ${
              menuOpen ? 'bg-ink text-paper' : 'bg-paper-deep text-ink hover:bg-hair'
            }`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* The menu: every page, one tap each. Placed right after its button so Tab moves straight into it.
              The capsule's backdrop blur makes it the containing block, so the panel is sized from the viewport
              and centred on the capsule (which is centred on the page); the animation sits on the inner box. */}
          {menuOpen && (
            <div id="site-menu" className="absolute left-1/2 top-[calc(100%+0.75rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 xl:hidden">
              <div className="sk-rise rounded-[28px] bg-white p-2" style={{ boxShadow: CAPSULE_SHADOW }}>
                <ul>
                  {NAV_LINKS.map((l) => (
                    <li key={l.label}>
                      <NavLink
                        to={l.to}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) => `${MENU_LINK} ${isActive ? 'bg-paper-deep text-ink' : ''}`}
                      >
                        {l.label}
                      </NavLink>
                    </li>
                  ))}
                  {/* The capsule is too narrow for the GitHub icon on small phones, so it moves in here. */}
                  <li className="sm:hidden">
                    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={`${MENU_LINK} gap-3`}>
                      <GithubIcon className="h-5 w-5" /> Source code on GitHub
                    </a>
                  </li>
                </ul>
                <div className="mt-2 border-t border-hair px-2 pb-1 pt-3">
                  {user ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate px-2 text-[14px] text-ink-soft">{user.email}</span>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="min-h-11 shrink-0 rounded-full px-4 text-[15px] font-medium text-ink transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link to="/login" onClick={() => setMenuOpen(false)} className={MENU_LINK}>Log in / Sign up</Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <Link to="/" className="flex items-center gap-2.5 rounded-xl sm:mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30" aria-label="Sankshep home">
            <BrandMark className="h-9 w-9 rounded-full" />
            {/* Small phones: the mark alone, so the capsule fits a 320px screen. */}
            <span className="hidden font-display text-[17px] text-ink sm:inline">Sankshep</span>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map((l) =>
              l.to.includes('#') ? (
                <Link key={l.label} to={l.to} className={PILL_LINK}>{l.label}</Link>
              ) : (
                <NavLink key={l.label} to={l.to} className={({ isActive }) => `${PILL_LINK} ${isActive ? 'bg-paper-deep text-ink' : ''}`}>
                  {l.label}
                </NavLink>
              ),
            )}
            {user ? (
              <>
                <span className="ml-1 max-w-[160px] truncate text-[13.5px] text-ink-soft">{user.email}</span>
                <button onClick={handleLogout} className={PILL_LINK}>Logout</button>
              </>
            ) : (
              <Link to="/login" className={PILL_LINK}>Log in / Sign up</Link>
            )}
          </div>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 sm:flex xl:h-9 xl:w-9"
            aria-label="Sankshep.ai source code on GitHub"
          >
            <GithubIcon className="h-5 w-5" />
          </a>

          <Link
            to="/workspace"
            className="ml-1 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3.5 py-2.5 text-[14px] font-medium text-paper sm:px-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Open Workspace
          </Link>
        </nav>
      </div>
    </header>
  )
}

const FOOTER_LINKS: { label: string; to: string; external?: boolean }[] = [
  { label: 'Terms and Conditions', to: '/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Github', to: GITHUB_URL, external: true },
  { label: 'Workspace', to: '/workspace' },
  { label: 'Features', to: '/features' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'The Pipeline', to: '/#how-it-works' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-hair bg-paper-deep">
      <div className="px-5 pb-4 pt-10 sm:px-8">
        {/* "Sankshep.ai" is about 5.4× as wide as its font size: 15.5vw keeps it inside the page at every width. */}
        <p className="font-display select-none whitespace-nowrap text-[clamp(2.5rem,15.5vw,17rem)] leading-[1.1] text-ink" aria-hidden>
          Sankshep<span className="text-matcha-deep">.ai</span>
        </p>
      </div>
      <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 border-t border-hair pt-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-ink-soft">© 2026 Sankshep.ai · Neural Ninjas VGEC</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((l) =>
              l.external ? (
                <a key={l.label} href={l.to} target="_blank" rel="noopener noreferrer" className="py-1 text-[13px] text-ink-soft transition-colors hover:text-ink">
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.to} className="py-1 text-[13px] text-ink-soft transition-colors hover:text-ink">
                  {l.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>
    </footer>
  )
}

/** Nav + page + footer on the paper background, for every marketing and legal page. */
export function SitePage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
    </div>
  )
}

/**
 * Router scroll behaviour: new pages start at the top, and "/#section" links
 * scroll to their section once the target page has rendered.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    let tries = 0
    const id = window.setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el || ++tries > 20) {
        window.clearInterval(id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
    return () => window.clearInterval(id)
  }, [pathname, hash])
  return null
}
