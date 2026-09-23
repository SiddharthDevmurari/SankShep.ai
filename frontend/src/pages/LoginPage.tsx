import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Zap } from 'lucide-react'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/workspace'

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fillDemo = async () => {
    setEmail('demo@sankshep.ai')
    setPassword('demo123')
    setMode('login')
    setError(null)
    setInfo(null)
    setLoading(true)
    const { error } = await signIn('demo@sankshep.ai', 'demo123')
    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate(from, { replace: true })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error)
        setLoading(false)
      } else {
        navigate(from, { replace: true })
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error)
        setLoading(false)
      } else {
        setInfo('Account created! Check your email for a confirmation link, or log in now.')
        setMode('login')
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[44%] bg-ink flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(#d4ed64 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative">
          <Link to="/" className="font-display text-[22px] text-paper">Sankshep.ai</Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="font-display text-[clamp(2.4rem,4vw,3.2rem)] text-paper leading-tight">
            Transform any content<br />
            into every format.
          </h2>
          <p className="text-[15px] text-paper/55 leading-relaxed max-w-xs">
            Upload reports, paste text, or drop a link. Get executive summaries, slide decks, LinkedIn posts and more — in seconds.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['Executive Summary', '5-Slide Deck', 'LinkedIn Post', 'Video Script', 'Advisory'].map((f) => (
              <span key={f} className="rounded-full border border-paper/15 px-3 py-1.5 text-[12px] font-medium text-paper/70">{f}</span>
            ))}
          </div>
        </div>
        <p className="relative text-[12px] text-paper/30">© 2026 Sankshep.ai · NTRO SIH</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Link to="/" className="font-display text-[18px] text-ink">Sankshep.ai</Link>
          </div>

          <h1 className="text-[24px] font-semibold text-ink">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            {mode === 'login'
              ? 'Sign in to access your workspace.'
              : 'Get started — it only takes a moment.'}
          </p>

          {/* Demo credentials button */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={fillDemo}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-matcha-deep bg-matcha/20 px-4 py-3 text-[14px] font-semibold text-ink transition-all hover:bg-matcha/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Zap className="h-4 w-4 text-matcha-deep" />
              [ Use Demo Credentials ]
            </button>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-ink-soft" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-hair bg-white px-4 py-3 text-[14px] text-ink outline-none ring-0 transition-all placeholder:text-ink-soft/50 focus:border-ink/30 focus:ring-2 focus:ring-ink/8"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-ink-soft" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-hair bg-white px-4 py-3 pr-11 text-[14px] text-ink outline-none ring-0 transition-all placeholder:text-ink-soft/50 focus:border-ink/30 focus:ring-2 focus:ring-ink/8"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/50 hover:text-ink-soft"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error / Info */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">
                {info}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-[14px] font-medium text-paper transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="mt-6 text-center text-[13.5px] text-ink-soft">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null) }}
              className="font-medium text-ink underline underline-offset-2 hover:no-underline"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>

          {/* Admin hint */}
          {mode === 'login' && (
            <p className="mt-4 text-center text-[11.5px] text-ink-soft/50">
              Admin access: admin@gmail.com / admin
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
