import { Link } from 'react-router-dom'
import { MotionConfig, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ArrowRight, GITHUB_URL, GithubIcon, SitePage } from '../components/site/SiteChrome'
import { useCopy } from '../i18n'

const TEAM = ['Siddharth Devmurari', 'Vraj Patel', 'Suhani Jain', 'Darshil Dhanani', 'Harshit Vadher', 'Harsh Thakkar']

const EASE = [0.22, 1, 0.36, 1] as const

const Strong = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-ink">{children}</strong>

// Team names stay in Latin script in both languages: they're real people's names, spelled as they write them.
const en = {
  eyebrow: 'About',
  intro: <>We built Sankshep.ai for the <Strong>Smart India Hackathon</Strong>: a workspace that turns one source document into the formats people actually need to send.</>,
  problemLabel: 'SIH problem statement',
  problem: '“Gen AI Platform for Automated Content Transformation”',
  why: [
    'Organisations spend hours turning news, reports, advisories, policy documents and research into briefs, posts, decks and scripts. Each one means reading the source again, working out what the audience needs, and writing it from scratch.',
    'Sankshep.ai does that step for them. Upload a document, pick the formats and the audience, and every draft is written in parallel from the same source, ready to check and edit.',
  ],
  name: <><span className="font-semibold text-ink">Why “Sankshep”?</span> संक्षेप (sankshep) is Hindi for “in brief”.</>,
  team: 'The team',
  cta: 'See what happens between upload and draft.',
  howItWorks: 'How it works',
  readCode: 'Read the code',
}

const hi: typeof en = {
  eyebrow: 'हमारे बारे में',
  intro: <>हमने Sankshep.ai को <Strong>स्मार्ट इंडिया हैकाथॉन</Strong> के लिए बनाया है: एक ऐसा वर्कस्पेस जो एक स्रोत दस्तावेज़ को उन फ़ॉर्मेट में बदल देता है जिन्हें लोग सच में भेजते हैं।</>,
  problemLabel: 'SIH समस्या विवरण',
  problem: '“स्वचालित कंटेंट रूपांतरण के लिए Gen AI प्लेटफ़ॉर्म”',
  why: [
    'संस्थाएँ समाचार, रिपोर्ट, एडवाइज़री, नीति दस्तावेज़ और रिसर्च को ब्रीफ़, पोस्ट, डेक और स्क्रिप्ट में बदलने में घंटों लगाती हैं। हर बार स्रोत को फिर से पढ़ना पड़ता है, समझना पड़ता है कि पाठकों को क्या चाहिए, और सब कुछ शुरू से लिखना पड़ता है।',
    'Sankshep.ai यही काम उनके लिए करता है। एक दस्तावेज़ अपलोड करें, फ़ॉर्मेट और पाठक चुनें, और हर ड्राफ़्ट उसी स्रोत से एक साथ लिखा जाता है, जाँचने और बदलने के लिए तैयार।',
  ],
  name: <><span className="font-semibold text-ink">नाम “Sankshep” क्यों?</span> संक्षेप का अर्थ है “कम शब्दों में”।</>,
  team: 'टीम',
  cta: 'देखिए, अपलोड से ड्राफ़्ट तक क्या होता है।',
  howItWorks: 'यह कैसे काम करता है',
  readCode: 'कोड पढ़ें',
}

export default function AboutPage() {
  const t = useCopy({ en, hi })
  return (
    <MotionConfig reducedMotion="user">
      <SitePage>
        {/* Team name is the page's one focal point */}
        <section className="mx-auto max-w-[1200px] px-5 pb-16 pt-14 sm:px-8 lg:pb-24 lg:pt-20">
          <p className="text-[13.5px] font-semibold text-ink-soft">{t.eyebrow}</p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="font-headline mt-4 text-[clamp(3.5rem,11vw,9.5rem)] text-ink"
          >
            Neural Ninjas <span className="font-serif text-matcha-deep">VGEC</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mt-8 max-w-[52ch] text-[18px] leading-relaxed text-ink-soft"
          >
            {t.intro}
          </motion.p>
        </section>

        {/* The project: what SIH asked for, and what the name means */}
        <section className="border-y border-hair bg-white">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-24">
            <div>
              <p className="text-[13.5px] font-semibold text-ink-soft">{t.problemLabel}</p>
              <p className="font-serif mt-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.15] text-ink">
                {t.problem}
              </p>
            </div>
            <div className="space-y-5 text-[16.5px] leading-[1.75] text-ink-soft lg:pt-9">
              {t.why.map((p) => <p key={p}>{p}</p>)}
              <p className="rounded-2xl bg-paper px-5 py-4 text-[15px]">{t.name}</p>
            </div>
          </div>
        </section>

        {/* Team: names only, as the team asked */}
        <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ink">{t.team}</h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-hair bg-hair sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((name, i) => (
              <motion.li
                key={name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                className="flex min-h-[150px] flex-col justify-between bg-paper p-6 sm:p-8"
              >
                <span className="font-mono text-[12.5px] text-ink-mute tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-headline mt-8 text-[clamp(1.9rem,3vw,2.5rem)] text-ink">{name}</span>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
          <div className="flex flex-col gap-6 rounded-3xl bg-ink px-8 py-12 text-paper sm:px-12 md:flex-row md:items-center md:justify-between">
            <p className="font-display max-w-md text-[clamp(1.6rem,3vw,2.2rem)] leading-tight">
              {t.cta}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/how-it-works"
                className="flex items-center gap-2 rounded-full bg-matcha px-6 py-3.5 text-[15px] font-medium text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
              >
                {t.howItWorks} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-paper/25 px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:border-paper/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-matcha/50"
              >
                <GithubIcon className="h-4 w-4" /> {t.readCode}
              </a>
            </div>
          </div>
        </section>
      </SitePage>
    </MotionConfig>
  )
}
