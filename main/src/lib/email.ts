/**
 * Checks a new account's email before sign-up. There is no confirmation email, so this is what stops a
 * typo like "name@gmal.cm" from becoming an account nobody can reach. Three passes, cheapest first:
 * the address's shape, near-misses of the big mail providers, then a DNS lookup that the domain takes mail.
 */

/** Real provider domains. Anything a letter or two away from one of these is treated as a typo of it. */
const PROVIDERS = [
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'outlook.com', 'outlook.in', 'live.com', 'live.in', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'protonmail.com', 'proton.me', 'pm.me', 'zoho.com', 'zohomail.in', 'rediffmail.com',
  'gmx.com', 'gmx.net', 'gmx.de', 'mail.com', 'yandex.com', 'tutanota.com',
]

/** Providers that only use the domains listed above, so "gmail.co" or "gmail.in" can only be a typo. */
const SINGLE_DOMAIN = ['gmail', 'googlemail', 'icloud', 'rediffmail', 'protonmail']

/** Endings that look like ".com" but aren't a top-level domain at all. */
const FAKE_COM = ['con', 'cmo', 'cpm', 'xom', 'vom', 'ocm', 'cim', 'comm', 'coom', 'copm']

/** Mail servers of domain-parking companies: typo domains like gmal.cm point here, and nobody reads it. */
const PARKED_MX = ['above.com', 'sedoparking.com', 'parkingcrew.net', 'bodis.com']

const LOCAL = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/
const LABEL = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

/** Edit distance: how many single-letter inserts, deletes or swaps turn a into b. */
function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = row
  }
  return prev[b.length]
}

/** The provider domain a mistyped one was probably meant to be, if any. */
function intendedDomain(domain: string): string | null {
  if (PROVIDERS.includes(domain)) return null
  const labels = domain.split('.')
  const tld = labels[labels.length - 1]
  if (FAKE_COM.includes(tld)) return [...labels.slice(0, -1), 'com'].join('.')
  if (SINGLE_DOMAIN.includes(labels[0])) return PROVIDERS.find((p) => p.startsWith(`${labels[0]}.`)) ?? null
  // Short domains only get one letter of slack, so "gmx.de" isn't read as a typo of "gmx.net".
  let best: string | null = null
  let bestDistance = Infinity
  for (const p of PROVIDERS) {
    // Same name, other ending: a regional domain like yahoo.co.uk or hotmail.fr. DNS judges those.
    if (p.split('.')[0] === labels[0]) continue
    const d = distance(domain, p)
    if (d <= (p.length >= 8 ? 2 : 1) && d < bestDistance) {
      best = p
      bestDistance = d
    }
  }
  return best
}

type MailCheck = 'accepts' | 'rejects' | 'unknown'

/** Asks DNS (Cloudflare, over HTTPS) whether the domain has a working mail server. Only the domain is sent. */
async function domainAcceptsMail(domain: string): Promise<MailCheck> {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return 'unknown'
    const dns = (await res.json()) as { Status: number; Answer?: { type: number; data: string }[] }
    if (dns.Status === 3) return 'rejects' // The domain doesn't exist.
    if (dns.Status !== 0) return 'unknown'
    const hosts = (dns.Answer ?? [])
      .filter((a) => a.type === 15)
      .map((a) => a.data.split(' ')[1]?.replace(/\.$/, '').toLowerCase() ?? '')
      // "0 ." is a domain saying outright that it takes no mail.
      .filter((h) => h !== '')
    if (hosts.length === 0) return 'rejects'
    if (hosts.every((h) => PARKED_MX.some((p) => h === p || h.endsWith(`.${p}`)))) return 'rejects'
    return 'accepts'
  } catch {
    return 'unknown'
  }
}

/**
 * Returns why this email can't be used for a new account, or null if it can. A DNS lookup that fails
 * (offline, blocked) doesn't block sign-up; only a clear "this domain takes no mail" does.
 */
export async function checkNewAccountEmail(raw: string): Promise<string | null> {
  const email = raw.trim().toLowerCase()
  const at = email.lastIndexOf('@')
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const labels = domain.split('.')
  if (
    at < 1 || local.length > 64 || !LOCAL.test(local) ||
    domain.length > 253 || labels.length < 2 || !labels.every((l) => LABEL.test(l)) || !/^[a-z]{2,}$/.test(labels[labels.length - 1])
  ) {
    return 'Enter a valid email address, like name@example.com.'
  }

  const intended = intendedDomain(domain)
  if (intended) return `“${domain}” looks like a typo. Did you mean ${local}@${intended}?`

  if ((await domainAcceptsMail(domain)) === 'rejects') {
    return `“${domain}” can’t receive email. Check the address for typos.`
  }
  return null
}
