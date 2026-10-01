import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/supabase'
import { PASSWORD_RULES, isStrongPassword, PASSWORD_POLICY_MESSAGE } from '../lib/password'
import { useCopy, useLang } from '../i18n'
import { ArrowUpRight, Check, Eye, EyeOff, UserX } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { BrandMark } from '../components/site/SiteChrome'

const EASE = [0.22, 1, 0.36, 1] as const

const en = {
  formats: ['Executive Summary', '5-Slide Deck', 'LinkedIn Post', 'Video Script', 'Advisory'],
  modes: {
    login: { tab: 'Sign in', title: 'Welcome back.', lead: 'Sign in to pick up where you left off.', submit: 'Sign in', busy: 'Signing in…' },
    signup: {
      tab: 'Create account',
      title: 'Start with one document.',
      lead: 'Create an account and go straight into the workspace. There is no email step.',
      submit: 'Create account',
      busy: 'Creating account…',
    },
  },
  home: 'Sankshep home',
  headline: <>One document, <span className="font-serif">every</span> format.</>,
  accountLabel: 'Account',
  email: 'Email',
  password: 'Password',
  newPassword: 'Create a password',
  yourPassword: 'Your password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  // In the order of PASSWORD_RULES.
  rules: PASSWORD_RULES.map((r) => r.label) as string[],
  met: '(met)',
  notMet: '(not met)',
  or: 'or look around first',
  demo: 'Continue with the demo account',
  enter: 'Enter',
  demoMissing: 'The demo account isn’t set up in the database yet. Run main/supabase/reset_accounts.sql in the Supabase SQL Editor.',
  // Messages from the auth code arrive in English; the workspace shows them as they are.
  error: (message: string) => message,
  disabledTitle: 'This account has been disabled',
  disabledBody: (email: ReactNode) => (
    <>An administrator has disabled {email}, so it can’t sign in. Your drafts and history are kept. Contact the administrator to have the account enabled again.</>
  ),
  disabledNext: 'Once it’s enabled, sign in as usual.',
  contactAdmin: 'Contact the admin',
}

/** Hindi for the messages AuthContext, lib/email and lib/password can return. Anything unrecognised stays in English. */
function hindiAuthError(message: string): string {
  const exact: Record<string, string> = {
    'Incorrect email or password.': 'ईमेल या पासवर्ड ग़लत है।',
    'This account has been disabled by the administrator.': 'एडमिनिस्ट्रेटर ने यह अकाउंट बंद कर दिया है।',
    'Too many attempts. Please wait a few minutes and try again.': 'बहुत ज़्यादा प्रयास हुए। कुछ मिनट रुककर फिर कोशिश करें।',
    'An account with this email already exists. Sign in instead.': 'इस ईमेल से अकाउंट पहले से बना है। इसके बजाय साइन इन करें।',
    'Enter a valid email address, like name@example.com.': 'सही ईमेल पता डालें, जैसे name@example.com।',
    [PASSWORD_POLICY_MESSAGE]: 'कम से कम 8 अक्षर रखें, जिनमें एक बड़ा अक्षर (A-Z), एक छोटा अक्षर (a-z), एक अंक और एक विशेष चिह्न हो।',
  }
  if (exact[message]) return exact[message]
  if (message.startsWith('Sign-up is misconfigured')) {
    return 'साइन-अप की सेटिंग ग़लत है: Supabase में ईमेल पुष्टि अभी भी चालू है। साइट एडमिन से “Confirm email” बंद करने को कहें।'
  }
  const network = message.match(/^Couldn't reach the sign-in service(.*)\. Check your connection and try again\.$/)
  if (network) return `साइन-इन सेवा तक नहीं पहुँच सके${network[1]}। अपना इंटरनेट कनेक्शन जाँचें और फिर कोशिश करें।`
  const typo = message.match(/^“(.+)” looks like a typo\. Did you mean (.+)\?$/)
  if (typo) return `“${typo[1]}” में टाइपिंग की ग़लती लगती है। क्या आपका मतलब ${typo[2]} था?`
  const noMail = message.match(/^“(.+)” can’t receive email\. Check the address for typos\.$/)
  if (noMail) return `“${noMail[1]}” पर ईमेल नहीं आ सकता। पते में टाइपिंग की ग़लती जाँचें।`
  return message
}

const hi: typeof en = {
  formats: ['कार्यकारी सारांश', '5 स्लाइड का डेक', 'LinkedIn पोस्ट', 'वीडियो स्क्रिप्ट', 'एडवाइज़री'],
  modes: {
    login: { tab: 'साइन इन', title: 'फिर से स्वागत है।', lead: 'साइन इन करें और वहीं से शुरू करें जहाँ छोड़ा था।', submit: 'साइन इन करें', busy: 'साइन इन हो रहा है…' },
    signup: {
      tab: 'नया अकाउंट',
      title: 'एक दस्तावेज़ से शुरुआत करें।',
      lead: 'अकाउंट बनाइए और सीधे वर्कस्पेस में पहुँचिए। ईमेल पुष्टि का कोई चरण नहीं है।',
      submit: 'अकाउंट बनाएँ',
      busy: 'अकाउंट बन रहा है…',
    },
  },
  home: 'Sankshep होम',
  headline: <>एक दस्तावेज़, <span className="font-serif">हर</span> फ़ॉर्मेट।</>,
  accountLabel: 'अकाउंट',
  email: 'ईमेल',
  password: 'पासवर्ड',
  newPassword: 'पासवर्ड बनाएँ',
  yourPassword: 'आपका पासवर्ड',
  showPassword: 'पासवर्ड दिखाएँ',
  hidePassword: 'पासवर्ड छिपाएँ',
  rules: ['8 या ज़्यादा अक्षर', 'एक बड़ा अक्षर (A-Z)', 'एक छोटा अक्षर (a-z)', 'एक अंक', 'एक विशेष चिह्न'],
  met: '(पूरा)',
  notMet: '(अधूरा)',
  or: 'या पहले घूमकर देखें',
  demo: 'डेमो अकाउंट से आगे बढ़ें',
  enter: 'प्रवेश करें',
  demoMissing: 'डेमो अकाउंट अभी डेटाबेस में सेट नहीं है। Supabase SQL Editor में main/supabase/reset_accounts.sql चलाएँ।',
  error: hindiAuthError,
  disabledTitle: 'यह अकाउंट बंद कर दिया गया है',
  disabledBody: (email: ReactNode) => (
    <>एक एडमिनिस्ट्रेटर ने {email} को बंद कर दिया है, इसलिए इससे साइन इन नहीं हो सकता। आपके ड्राफ़्ट और हिस्ट्री सुरक्षित हैं। अकाउंट फिर से चालू कराने के लिए एडमिनिस्ट्रेटर से संपर्क करें।</>
  ),
  disabledNext: 'चालू होने के बाद, हमेशा की तरह साइन इन करें।',
  contactAdmin: 'एडमिन से संपर्क करें',
}
const field =
  'w-full rounded-lg border border-hair bg-paper px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-mute/70 hover:border-line focus:border-ink focus:bg-white focus-visible:ring-2 focus-visible:ring-matcha'

export default function LoginPage() {
  const { user, loading: authLoading, signIn, signUp, disabledEmail, clearDisabledNotice } = useAuth()
  const t = useCopy({ en, hi })
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  // Only return to a workspace page; anything else in navigation state is ignored.
  const requested = (location.state as { from?: { pathname?: string } })?.from?.pathname
  const from = requested && /^\/workspace(\/|$)/.test(requested) ? requested : '/workspace'

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // The account an admin disabled: tried here, or signed out of the workspace because of it.
  const [disabledFor, setDisabledFor] = useState<string | null>(disabledEmail)
  const clearNotices = () => {
    setError(null)
    setDisabledFor(null)
    clearDisabledNotice()
  }

  const fillDemo = async () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setMode('login')
    clearNotices()
    setLoading(true)
    const { error, disabled } = await signIn(DEMO_EMAIL, DEMO_PASSWORD)
    if (disabled) {
      setDisabledFor(DEMO_EMAIL)
      setLoading(false)
    } else if (error) {
      setError(/incorrect email or password/i.test(error) ? t.demoMissing : error)
      setLoading(false)
    } else {
      navigate(from, { replace: true })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearNotices()
    if (mode === 'signup' && !isStrongPassword(password)) {
      setError(PASSWORD_POLICY_MESSAGE)
      return
    }
    setLoading(true)

    // Sign-up creates the account and signs in immediately, with no email step.
    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password)
    const { error } = result
    if ('disabled' in result && result.disabled) {
      setDisabledFor(email.trim())
      setLoading(false)
    } else if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate(from, { replace: true })
    }
  }

  // Already signed in: skip the form. Mid-submit this is harmless, since both go to `from`.
  if (!authLoading && user && !loading) return <Navigate to={from} replace />

  const copy = t.modes[mode]
  const switchMode = (next: 'login' | 'signup') => {
    if (next === mode) return
    setMode(next)
    clearNotices()
  }

  return (
    <MotionConfig reducedMotion="user">
      {/* Sits under the capsule nav, so fill what's left of the viewport. The dot grid is the same
          texture as the landing hero, so the form sits on the site's own canvas. */}
      <main lang={lang} className="relative isolate flex min-h-[calc(100dvh-6rem)] items-center justify-center overflow-hidden bg-paper px-4 py-10 sm:px-8 lg:py-16">
        {/* Same dot grid as the landing hero, one step darker so it reads behind the card */}
        <div
          aria-hidden
          className="sk-dots-fade pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#cfcbbd_1px,transparent_1px)] bg-[size:22px_22px]"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative w-full max-w-[1000px]"
        >
          {/* Landing showcase frame: lime glow, lime edge gradient, then a solid ink border on the card */}
          <div aria-hidden className="sk-glow-ring pointer-events-none absolute -inset-3 rounded-[34px] bg-matcha/50 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -inset-px rounded-[25px] bg-gradient-to-br from-matcha via-transparent to-matcha/40" />
          <div className="relative grid overflow-hidden rounded-3xl border-2 border-ink bg-white shadow-[0_20px_50px_-20px_rgba(15,16,15,0.45)] ring-1 ring-ink/5 md:grid-cols-[5fr_6fr]">
          {/* Editorial side: warm paper tone, so it reads as one sheet with the form */}
          <aside className="flex flex-col justify-between gap-10 bg-paper-deep px-7 py-8 sm:px-10 sm:py-10">
            <Link
              to="/"
              aria-label={t.home}
              className="inline-flex w-fit items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
            >
              <BrandMark className="h-10 w-10 rounded-full ring-1 ring-ink/10" />
              <span className="font-display text-[20px] text-ink">Sankshep.ai</span>
            </Link>

            <div>
              <h2 className="font-display max-w-[13ch] text-[clamp(2rem,3.6vw,2.9rem)] text-balance text-ink">
                {t.headline}
              </h2>
              <ol className="mt-8 hidden divide-y divide-line border-y border-line md:block">
                {t.formats.map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 + i * 0.07, ease: EASE }}
                    className="flex items-baseline gap-4 py-2.5 text-[14.5px] text-ink"
                  >
                    <span className="font-mono text-[11.5px] tabular-nums text-ink-mute">0{i + 1}</span>
                    {f}
                  </motion.li>
                ))}
              </ol>
            </div>

            <p className="hidden text-[12.5px] text-ink-mute md:block">© 2026 Sankshep.ai · NTRO SIH</p>
          </aside>

          {/* Form side */}
          <section className="px-7 py-8 sm:px-10 sm:py-10 lg:px-14">
            {/* Mode switch: one control, so Sign in and Create account read as two views of the same page */}
            <div role="tablist" aria-label={t.accountLabel} className="relative grid grid-cols-2 rounded-xl bg-paper-deep p-1">
              {(['login', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className="relative rounded-lg py-2 text-[14px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink"
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_2px_rgba(15,16,15,0.08)]"
                    />
                  )}
                  <span className={`relative ${mode === m ? 'text-ink' : 'text-ink-mute hover:text-ink'}`}>
                    {t.modes[m].tab}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-8 min-h-[104px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <h1 className="font-display text-[clamp(1.9rem,3vw,2.4rem)] text-ink">{copy.title}</h1>
                  <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-ink-soft">{copy.lead}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-soft" htmlFor="email">
                  {t.email}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={field}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-soft" htmlFor="password">
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={mode === 'signup' ? 8 : undefined}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    aria-describedby={mode === 'signup' ? 'password-rules' : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? t.newPassword : t.yourPassword}
                    className={`${field} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? t.hidePassword : t.showPassword}
                    aria-pressed={showPass}
                    className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-ink-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Live checklist on sign-up, so the rules are met before submit, not discovered after */}
                <AnimatePresence initial={false}>
                  {mode === 'signup' && (
                    <motion.ul
                      id="password-rules"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="grid grid-cols-1 gap-x-4 gap-y-1.5 overflow-hidden pt-2 sm:grid-cols-2"
                    >
                      {PASSWORD_RULES.map((r, i) => {
                        const ok = r.test(password)
                        return (
                          <li key={r.id} className={`flex items-center gap-2 text-[12.5px] transition-colors ${ok ? 'text-ink' : 'text-ink-mute'}`}>
                            <span
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors ${ok ? 'border-ink bg-ink text-paper' : 'border-line'}`}
                              aria-hidden
                            >
                              {ok && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                            </span>
                            {t.rules[i]}
                            <span className="sr-only">{ok ? t.met : t.notMet}</span>
                          </li>
                        )
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {disabledFor ? (
                <AccountDisabledNotice email={disabledFor} />
              ) : error && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] leading-relaxed text-red-800"
                >
                  {t.error(error)}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-ink px-4 py-3.5 text-[15px] font-medium text-paper transition-all duration-200 hover:bg-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden />
                    {copy.busy}
                  </>
                ) : (
                  copy.submit
                )}
              </button>
            </form>

            {/* Quick access: a quiet row under the form, not a banner above it */}
            <div className="mt-7 flex items-center gap-4 text-[12.5px] text-ink-mute" aria-hidden>
              <span className="h-px flex-1 bg-hair" />
              {t.or}
              <span className="h-px flex-1 bg-hair" />
            </div>
            <button
              type="button"
              onClick={fillDemo}
              disabled={loading}
              className="group mt-4 flex w-full items-center justify-between gap-4 rounded-xl bg-matcha/25 px-4 py-3 text-left transition-all duration-200 hover:bg-matcha/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="min-w-0">
                <span className="block text-[14.5px] font-medium text-ink">{t.demo}</span>
                <span className="mt-0.5 block truncate font-mono text-[12px] text-ink-soft">{DEMO_EMAIL}</span>
              </span>
              <span className="shrink-0 text-[13px] font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors group-hover:decoration-ink">
                {t.enter}
              </span>
            </button>
          </section>
          </div>
        </motion.div>
      </main>
    </MotionConfig>
  )
}

/** Shown when an admin has disabled the account: what happened, what's kept, and who can undo it. */
function AccountDisabledNotice({ email }: { email: string }) {
  const t = useCopy({ en, hi })
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50"
    >
      <div className="flex items-start gap-3 px-4 pb-3.5 pt-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-amber-700 ring-1 ring-amber-200" aria-hidden>
          <UserX className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-amber-950">{t.disabledTitle}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-amber-950/80">
            {t.disabledBody(<span className="break-all font-medium text-amber-950">{email}</span>)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-amber-200 bg-white/60 px-4 py-2.5">
        <span className="text-[12.5px] text-amber-950/70">{t.disabledNext}</span>
        <Link
          to="/contact"
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        >
          {t.contactAdmin} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </motion.div>
  )
}
