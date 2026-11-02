import type { ReactNode } from 'react'
import type { ABOUT_COPY } from '../../pages/AboutPage'

const Strong = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-ink">{children}</strong>

const t: typeof ABOUT_COPY.en = {
  eyebrow: 'અમારા વિશે',
  intro: <>અમે Sankshep.ai ને <Strong>સ્માર્ટ ઇન્ડિયા હેકાથોન</Strong> માટે બનાવ્યું છે: એક એવું workspace જે એક મૂળ દસ્તાવેજને એવા સ્વરૂપોમાં બદલે છે જે લોકોને ખરેખર મોકલવાની જરૂર હોય છે.</>,
  problemLabel: 'SIH સમસ્યા વિવરણ',
  problem: '“સ્વયંસંચાલિત કન્ટેન્ટ રૂપાંતર માટે Gen AI પ્લેટફોર્મ”',
  why: [
    'સંસ્થાઓ સમાચાર, રિપોર્ટ, એડવાઇઝરી, નીતિ દસ્તાવેજો અને રિસર્ચને બ્રીફ, પોસ્ટ, ડેક અને સ્ક્રિપ્ટમાં બદલવામાં કલાકો ગાળે છે. દરેક વખતે મૂળ દસ્તાવેજ ફરીથી વાંચવો પડે છે, વાચકોને શું જોઈએ છે તે સમજવું પડે છે, અને બધું જ શરૂઆતથી લખવું પડે છે.',
    'Sankshep.ai આ જ કામ તેમના માટે કરે છે. દસ્તાવેજ અપલોડ કરો, ફોર્મેટ અને વાચકો પસંદ કરો, અને દરેક ડ્રાફ્ટ તે જ મૂળ દસ્તાવેજમાંથી એક સાથે લખાઈ જાય છે, ચકાસવા અને સુધારવા માટે તૈયાર.',
  ],
  name: <><span className="font-semibold text-ink">નામ “Sankshep” શા માટે?</span> સંક્ષેપ નો અર્થ “ટૂંકમાં” થાય છે.</>,
  team: 'ટીમ',
  cta: 'જુઓ, અપલોડથી ડ્રાફ્ટ સુધી શું થાય છે.',
  howItWorks: 'આ કેવી રીતે કામ કરે છે',
  readCode: 'કોડ વાંચો',
}

export default t
