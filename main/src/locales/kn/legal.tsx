import type { ReactNode } from 'react'
import type { LEGAL_COPY } from '../../pages/legal/LegalLayout'

const t: typeof LEGAL_COPY.en = {
  eyebrow: 'ಕಾನೂನಿ',
  updated: 'ಕೊನೆಯ ನವೀಕರಣ',
  summaryLabel: 'ಸಾರಾಂಶ',
  shortVersion: 'ಸಂಕ್ಷೇಪ್‌ನಲ್ಲಿ',
  contents: 'ವಿಷಯಗಳು',
  readWith: (link: ReactNode) => <>ಇದನ್ನು ನಮ್ಮ {link} ಜೊತೆಗೆ ಓದಿ.</>,
  translationNote: 'ಈ ಕನ್ನಡ ಅನುವಾದವು ನಿಮ್ಮ ಅನುಕೂಲಕ್ಕಾಗಿ ಮಾತ್ರ. ಇಂಗ್ಲಿಷ್ ಆವೃತ್ತಿಯೊಂದಿಗೆ ಯಾವುದೇ ವ್ಯತ್ಯಾಸವಿದ್ದರೆ ಇಂಗ್ಲಿಷ್ ಆವೃತ್ತಿಯೇ ಅಂತಿಮ.',
}

export default t
