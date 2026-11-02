import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'ଆଇନଗତ',
  updated: 'ଶେଷ ଅପଡେଟ୍',
  summaryLabel: 'ସାରାଂଶ',
  shortVersion: 'ସଂକ୍ଷେପରେ',
  contents: 'ବିଷୟବସ୍ତୁ',
  readWith: (link: React.ReactNode) => <>ଏହାକୁ ଆମର {link} ସହିତ ପଢନ୍ତୁ।</>,
  translationNote: 'ଏହି ଓଡ଼ିଆ ଅନୁବାଦ ଆପଣଙ୍କ ସୁବିଧା ପାଇଁ ଅଟେ। ଇଂରାଜୀ ସଂସ୍କରଣ ସହିତ କୌଣସି ପାର୍ଥକ୍ୟ ଥିଲେ ଇଂରାଜୀ ସଂସ୍କରଣ ହିଁ ମାନ୍ୟ ହେବ।',
}

export default t
