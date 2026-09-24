import { Link } from 'react-router-dom'
import { GITHUB_URL } from '../../components/site/SiteChrome'
import { LegalLayout, type LegalSection } from './LegalLayout'

const ISSUES_URL = GITHUB_URL.replace(/\.git$/, '') + '/issues'

const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreeing to these terms',
    body: (
      <>
        <p>
          These terms apply to the Sankshep.ai website and workspace (“Sankshep.ai”, “the service”), built by the team Neural Ninjas VGEC
          (“we”, “us”). By creating an account or using the workspace, you agree to them. If you do not agree, please do not use the service.
        </p>
        <p>They were written by the team for this student project and have not been reviewed by a lawyer.</p>
      </>
    ),
  },
  {
    id: 'the-service',
    title: 'The service',
    body: (
      <p>
        Sankshep.ai is a Smart India Hackathon prototype that turns source material into drafts in formats such as executive summaries,
        social posts, slide outlines and translations. It is provided free of charge, for evaluation and learning. Features may change,
        break or be removed at any time, and the service may be paused or shut down without notice.
      </p>
    ),
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: (
      <>
        <ul>
          <li>Use an email address you control and keep your password to yourself. You are responsible for what happens under your account.</li>
          <li>The shared demo account is open to everyone. Treat anything you put into it as public.</li>
          <li>We may suspend or delete accounts that break these terms or put the service or other users at risk.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>submit content that is unlawful, or that you do not have the right to use;</li>
          <li>use the service to create content meant to harass, defraud, impersonate or mislead people;</li>
          <li>try to access other people’s accounts or data, or get around the service’s access controls;</li>
          <li>overload the service with automated or high-volume requests, or interfere with its operation;</li>
          <li>break the usage policies of the AI provider whose model you use.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-content',
    title: 'Your content',
    body: (
      <p>
        You keep whatever rights you have in the material you submit and in the drafts generated from it. You give us permission to process
        and store that material only as needed to run the service, as described in the{' '}
        <Link to="/privacy-policy">Privacy Policy</Link>, including sending it to the AI provider you select.
      </p>
    ),
  },
  {
    id: 'ai-output',
    title: 'AI-generated drafts',
    body: (
      <>
        <p>
          Drafts are written by AI models. They can be wrong, incomplete or out of date, and they can include statements or numbers that are
          not in your source. <strong>Check every draft before you use or publish it.</strong> You are responsible for what you do with them.
        </p>
        <p>Nothing Sankshep.ai produces is legal, financial, medical or other professional advice.</p>
      </>
    ),
  },
  {
    id: 'providers-and-keys',
    title: 'AI providers and your API keys',
    body: (
      <p>
        Generation is performed by third-party providers (Groq, Google’s Gemini API and Mistral AI), and their own terms apply to that use.
        If you add your own API key, any usage and charges on that key are between you and the provider. We are not responsible for a
        provider’s outages, changes, pricing or handling of your requests.
      </p>
    ),
  },
  {
    id: 'our-rights',
    title: 'Our intellectual property',
    body: (
      <p>
        The Sankshep.ai name, design and software belong to the team. The source code is published on{' '}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>; publishing it does not by itself grant a licence to reuse
        it, unless the repository states one.
      </p>
    ),
  },
  {
    id: 'disclaimer',
    title: 'No warranty',
    body: (
      <p>
        The service is provided “as is” and “as available”, without warranties of any kind, including that it will be accurate, uninterrupted,
        secure or fit for a particular purpose.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        To the fullest extent the law allows, we are not liable for any indirect, incidental or consequential loss, or for loss of data,
        profits or reputation, arising from your use of the service or of any draft it produces. The service is free, and our total liability
        to you is limited accordingly.
      </p>
    ),
  },
  {
    id: 'ending',
    title: 'Ending your use',
    body: (
      <p>
        You can stop using Sankshep.ai at any time and delete your account from the account menu in the workspace, which permanently removes
        your data. We may end or suspend access as described under Your account.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    body: <p>These terms are governed by the laws of India. Any dispute is subject to the courts of Ahmedabad, Gujarat.</p>,
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: <p>We may update these terms. When we do, we change the date at the top; continuing to use the service means you accept the update.</p>,
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these terms go to the team through the project’s{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">GitHub issues page</a>.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      updated="September 25, 2026"
      sections={SECTIONS}
      sibling={{ label: 'Privacy Policy', to: '/privacy-policy' }}
      summary={
        <>
          <p>Sankshep.ai is a <strong>free student prototype</strong>, offered as is. It can change or stop.</p>
          <p>AI drafts can be wrong. <strong>Check them before you use them.</strong> Your content stays yours.</p>
          <p>Don’t misuse it, and remember the <strong>demo account is shared</strong> with everyone.</p>
        </>
      }
    />
  )
}
