import { Link } from 'react-router-dom'
import { GITHUB_URL } from '../../components/site/SiteChrome'
import { LegalLayout, type LegalSection } from './LegalLayout'

const ISSUES_URL = GITHUB_URL.replace(/\.git$/, '') + '/issues'

// Every statement here describes what the code does today (lib/activity.ts,
// lib/providers.ts, lib/ingest.ts, supabase/schema.sql). Update it when they change.
const SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          Sankshep.ai is a student project built by the team <strong>Neural Ninjas VGEC</strong> for the Smart India Hackathon.
          It is a prototype, not a commercial service, and it is offered free of charge.
        </p>
        <p>
          This policy explains what information the Sankshep.ai website and workspace collect, why, where it goes, and how you can
          remove it. It was written by the team for this project and has not been reviewed by a lawyer.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <p><strong>Your account.</strong> Your email address, your password (stored by our authentication provider as a salted hash that we cannot read), and the dates you signed up and last signed in.</p>
        <p><strong>Your activity.</strong> Each sign-in, sign-out, generation and refinement is recorded. For a generation we store:</p>
        <ul>
          <li>how you supplied the source (upload, link or pasted text) and the file name or link;</li>
          <li>the first 300 characters of the source, and its length in characters and words;</li>
          <li>the formats, tone, target language, custom instructions and refinement instructions you chose;</li>
          <li>the drafts that were generated, which provider and model wrote each one, whether it succeeded, any error message, and how long it took.</li>
        </ul>
        <p><strong>What we do not collect.</strong> We do not store your full source document or uploaded files beyond the 300-character preview, we do not store uploaded images, we never store your AI provider API keys, and we do not use analytics, advertising or tracking scripts.</p>
      </>
    ),
  },
  {
    id: 'ai-providers',
    title: 'How your content is processed',
    body: (
      <>
        <p>
          To write drafts, the text of your source and your instructions are sent from your browser to the AI provider you select in the
          workspace: <strong>Groq</strong>, <strong>Google (Gemini API)</strong> or <strong>Mistral AI</strong>. Each provider handles that
          content under its own terms and privacy policy, which may allow it to keep requests for a period. We do not control their retention.
        </p>
        <p>
          If you upload an image, it is either sent to a provider’s image-reading model (when you have chosen one and added its key) or read
          by an OCR engine that runs inside your browser. The OCR engine is downloaded from a public content delivery network (jsDelivr);
          the image itself does not leave your device in that case.
        </p>
      </>
    ),
  },
  {
    id: 'api-keys',
    title: 'Your API keys',
    body: (
      <>
        <p>
          When you paste your own Groq, Gemini or Mistral key, it is kept only in the memory of that browser tab and is sent only to that
          provider, with each request. It is never written to our database, our logs or your browser storage, and it is gone as soon as you
          reload or close the tab.
        </p>
        <p>If you leave the Groq key empty, requests use a Groq key that belongs to this project.</p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use your information',
    body: (
      <>
        <ul>
          <li>to sign you in and keep your workspace private to you;</li>
          <li>to show you your own History and Analytics pages;</li>
          <li>to let the project administrator see how the prototype is used, remove accounts, and investigate failures.</li>
        </ul>
        <p>We do not sell your information, we do not use it for advertising, and we do not use it to train AI models.</p>
      </>
    ),
  },
  {
    id: 'who-can-see',
    title: 'Who can see it',
    body: (
      <>
        <ul>
          <li><strong>You</strong>, in your History and Analytics pages.</li>
          <li><strong>The project administrator</strong>, whose Admin panel lists every account and its activity, including stored drafts.</li>
          <li><strong>Supabase</strong>, which hosts our authentication and database.</li>
          <li><strong>Our website host</strong>, which keeps standard request logs such as IP address, browser type and the pages requested.</li>
        </ul>
        <p>
          <strong>The shared demo account is public.</strong> Its email and password are shown on the sign-in page, so anything you generate
          while signed in as the demo account can be seen by anyone else who uses it. Do not put private material into the demo account.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'How we protect it',
    body: (
      <>
        <p>
          Data travels over encrypted HTTPS connections. In the database, row-level security rules only let a signed-in account read its own
          records (the administrator excepted) and only add records as itself; account and admin actions are checked on the server, not just
          in the browser.
        </p>
        <p>No system is perfectly secure. If you find a weakness, please report it privately using the contact route below before sharing it.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Keeping and deleting your data',
    body: (
      <>
        <p>
          We keep your account and activity until the account is deleted. You can delete it at any time from the account menu in the
          workspace (<strong>Delete account</strong>). This immediately and permanently removes your account and your entire activity history.
        </p>
        <p>The shared demo account and the administrator account cannot be deleted this way. The administrator can also remove any other account.</p>
      </>
    ),
  },
  {
    id: 'storage',
    title: 'Cookies and browser storage',
    body: (
      <p>
        We do not set tracking or advertising cookies. When you sign in, your session token is kept in your browser’s local storage so you
        stay signed in; logging out removes it.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          You can see your stored activity on your <Link to="/workspace/history">History</Link> page and delete everything with Delete account.
          Where India’s Digital Personal Data Protection Act, 2023 applies to you, you may also ask us to correct or erase your personal data,
          or ask questions about how it is processed, using the contact route below.
        </p>
        <p>Sankshep.ai is not intended for anyone under 18.</p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: <p>When what we collect or how we use it changes, we update this page and the date at the top.</p>,
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions or requests go to the team through the project’s{' '}
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">GitHub issues page</a>. For a security issue, open an issue asking
        for a private channel rather than posting the details publicly.
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="September 25, 2026"
      sections={SECTIONS}
      sibling={{ label: 'Terms and Conditions', to: '/terms-and-conditions' }}
      summary={
        <>
          <p>We store your <strong>email</strong>, your <strong>activity</strong> and the <strong>drafts</strong> you generate, so you can see your history.</p>
          <p>Your source text goes to the <strong>AI provider you choose</strong>. Your <strong>API keys are never stored</strong>.</p>
          <p>No ads, no trackers, no selling data, no training on it. <strong>Delete account</strong> removes everything.</p>
        </>
      }
    />
  )
}
