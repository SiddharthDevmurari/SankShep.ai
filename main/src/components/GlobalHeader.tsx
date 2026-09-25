import { useLocation } from 'react-router-dom'
import { SiteNav } from './site/SiteChrome'

export function GlobalHeader() {
  const { pathname } = useLocation()

  // The landing page, static pages and workspace carry their own navigation; this header is only for /login.
  if (pathname !== '/login') return null

  return <SiteNav />
}
