import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MotionConfig, motion } from 'motion/react'
import { Check, Copy, Mail } from 'lucide-react'
import { ArrowRight, GITHUB_URL, GithubIcon, SitePage } from '../components/site/SiteChrome'

/** Inline LinkedIn mark: lucide-react 1.x has no brand icons. */
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
)

interface Member {
  name: string
  github: string
  linkedin: string
  email: string
}

const TEAM: Member[] = [
  {
    name: 'Siddharth Devmurari',
    github: 'https://github.com/SiddharthDevmurari',
    linkedin: 'https://www.linkedin.com/in/siddharth-devmurari-4b7915391',
    email: 'siddharthdevmurari07@gmail.com',
  },
  {
    name: 'Vraj Patel',
    github: 'https://github.com/vrajp1010-eng',
    linkedin: 'https://www.linkedin.com/in/vraj-patel-07a582377',
    email: 'vrajp4752@gmail.com',
  },
  {
    name: 'Suhani Jain',
    github: 'https://github.com/Suhani2612',
    linkedin: 'https://www.linkedin.com/in/suhani-jain-3938a3305',
    email: 'suhanijain26122006@gmail.com',
  },
  {
    name: 'Darshil Dhanani',
    github: 'https://github.com/DarshilDhanani04',
    linkedin: 'https://www.linkedin.com/in/darshil-dhanani-444aa5319',
    email: 'darshildhanani04@gmail.com',
  },
  {
    name: 'Harshit Vadher',
    github: 'https://github.com/HarshitsinhVadher',
    linkedin: 'https://www.linkedin.com/in/harshitkumar-vadher-529654350',
    email: 'harshitsinhvadher@gmail.com',
  },
]

const EASE = [0.22, 1, 0.36, 1] as const

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
const githubHandle = (url: string) => '@' + url.replace(/\/+$/, '').split('/').pop()

export default function ContactPage() {
  return (
    <MotionConfig reducedMotion="user">
      <SitePage>
        {/* Headline is the page's focal point; the lead points straight at the right person */}
        <section className="mx-auto max-w-[1200px] px-5 pb-12 pt-14 sm:px-8 lg:pb-16 lg:pt-20">
          <p className="text-[13.5px] font-semibold text-ink-soft">Contact</p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="font-display mt-4 max-w-[16ch] text-[clamp(2.9rem,6.4vw,5rem)] text-ink"
          >
            Talk to the people who built it.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mt-7 max-w-[54ch] text-[18px] leading-relaxed text-ink-soft"
          >
            Questions about Sankshep.ai, the code, or our Smart India Hackathon build? Write to any of us directly, or open an issue on
            GitHub.
          </motion.p>
        </section>

        {/* One card per person: GitHub, LinkedIn and email, each a real link */}
        <section aria-label="Team contacts" className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-8 lg:pb-24">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {TEAM.map((m, i) => (
              <motion.li
                key={m.email}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
                // Three per row on desktop; the last two share the second row, centred.
                className={`min-w-0 lg:col-span-2 ${i === 3 ? 'lg:col-start-2' : ''} ${i === TEAM.length - 1 && TEAM.length % 2 === 1 ? 'sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc(50%-10px)] lg:col-span-2 lg:mx-0 lg:max-w-none' : ''}`}
              >
                <MemberCard member={m} index={i} />
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="flex flex-col gap-6 rounded-3xl bg-ink px-8 py-12 text-paper sm:px-12 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display max-w-md text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">Found a bug or have an idea?</p>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-paper/75">
                Issues and pull requests on the repository reach the whole team at once.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={GITHUB_URL.replace(/\.git$/, '') + '/issues'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-matcha px-6 py-3.5 text-[15px] font-medium text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
              >
                <GithubIcon className="h-4 w-4" /> Open an issue
              </a>
              <Link
                to="/about"
                className="flex items-center gap-2 rounded-full border border-paper/25 px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:border-paper/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
              >
                About the project <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </SitePage>
    </MotionConfig>
  )
}

const ROW =
  'group flex min-h-12 items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-paper-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30'
const ICON_TILE =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-deep text-ink ring-1 ring-hair transition-colors group-hover:bg-ink group-hover:text-matcha group-hover:ring-ink'

function MemberCard({ member, index }: { member: Member; index: number }) {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(member.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard blocked (e.g. insecure context): the mailto link still works.
    }
  }

  return (
    <article className="flex h-full flex-col rounded-3xl border border-hair bg-white p-6 transition-shadow hover:shadow-[0_18px_40px_-24px_rgba(15,16,15,0.25)] sm:p-7">
      <header className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-[20px] text-matcha"
        >
          {initials(member.name)}
        </span>
        <div className="min-w-0">
          <span className="font-mono text-[12px] text-ink-mute tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <h2 className="font-display text-[clamp(1.35rem,2vw,1.6rem)] leading-tight text-ink">{member.name}</h2>
        </div>
      </header>

      <div className="mt-6 space-y-1 border-t border-hair pt-4">
        <a href={member.github} target="_blank" rel="noopener noreferrer" className={ROW} aria-label={`${member.name} on GitHub`}>
          <span className={ICON_TILE}><GithubIcon className="h-[18px] w-[18px]" /></span>
          <span className="min-w-0">
            <span className="block text-[12px] text-ink-mute">GitHub</span>
            <span className="block truncate text-[14px] font-medium text-ink">{githubHandle(member.github)}</span>
          </span>
        </a>

        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className={ROW} aria-label={`${member.name} on LinkedIn`}>
          <span className={ICON_TILE}><LinkedInIcon className="h-[17px] w-[17px]" /></span>
          <span className="min-w-0">
            <span className="block text-[12px] text-ink-mute">LinkedIn</span>
            <span className="block truncate text-[14px] font-medium text-ink">View profile</span>
          </span>
        </a>

        <div className="flex items-center gap-1">
          <a href={`mailto:${member.email}`} className={`${ROW} min-w-0 flex-1`} aria-label={`Email ${member.name}`}>
            <span className={ICON_TILE}><Mail className="h-[18px] w-[18px]" /></span>
            <span className="min-w-0">
              <span className="block text-[12px] text-ink-mute">Email</span>
              {/* Wraps rather than truncating (an address has to be readable in full), preferably right after the @. */}
              <span className="block text-[14px] font-medium text-ink [overflow-wrap:anywhere]">
                {member.email.split('@')[0]}@<wbr />{member.email.split('@')[1]}
              </span>
            </span>
          </a>
          <button
            type="button"
            onClick={copyEmail}
            aria-label={copied ? 'Email address copied' : `Copy ${member.name}'s email address`}
            title={copied ? 'Copied' : 'Copy address'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            {copied ? <Check className="h-4 w-4 text-ink" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p role="status" className="sr-only">{copied ? `${member.email} copied` : ''}</p>
      </div>
    </article>
  )
}
