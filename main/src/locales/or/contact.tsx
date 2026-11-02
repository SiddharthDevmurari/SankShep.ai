import type { CONTACT_COPY } from '../../pages/ContactPage'

const t: typeof CONTACT_COPY.en = {
  eyebrow: 'ଯୋଗାଯୋଗ',
  title: 'ଏହାକୁ ତିଆରି କରିଥିବା ଲୋକଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ।',
  lead: 'Sankshep.ai, ଏହାର କୋଡ୍ କିମ୍ବା ଆମର ସ୍ମାର୍ଟ ଇଣ୍ଡିଆ ହ୍ୟାକାଥନ୍ ପ୍ରୋଜେକ୍ଟ ବିଷୟରେ କିଛି ପ୍ରଶ୍ନ ଅଛି କି? ଆମ ଭିତରୁ ଯେକୌଣସି ଜଣଙ୍କୁ ସିଧାସଳଖ ଲେଖନ୍ତୁ, କିମ୍ବା GitHub ରେ ଏକ issue ଖୋଲନ୍ତୁ।',
  contactsLabel: 'ଟିମ୍ ଯୋଗାଯୋଗ',
  bugTitle: 'କୌଣସି ବଗ୍ ମିଳିଲା କିମ୍ବା କୌଣସି ପରାମର୍ଶ ଅଛି କି?',
  bugBody: 'ରିପୋଜିଟୋରିରେ issue ଏବଂ pull request ଏକାସାଙ୍ଗରେ ସମସ୍ତ ଟିମ୍ ପାଖରେ ପହଞ୍ଚିଥାଏ।',
  openIssue: 'Issue ଖୋଲନ୍ତୁ',
  aboutProject: 'ପ୍ରୋଜେକ୍ଟ ବିଷୟରେ',
  onGithub: (name: string) => `GitHub ରେ ${name}`,
  onLinkedin: (name: string) => `LinkedIn ରେ ${name}`,
  viewProfile: 'ପ୍ରୋଫାଇଲ୍ ଦେଖନ୍ତୁ',
  email: 'ଇମେଲ୍',
  emailName: (name: string) => `${name}ଙ୍କୁ ଇମେଲ୍ କରନ୍ତୁ`,
  copyLabel: (name: string) => `${name}ଙ୍କ ଇମେଲ୍ ଠିକଣା କପି କରନ୍ତୁ`,
  copiedLabel: 'ଇମେଲ୍ ଠିକଣା କପି ହୋଇଗଲା',
  copyTitle: 'ଠିକଣା କପି କରନ୍ତୁ',
  copiedTitle: 'କପି ହୋଇଗଲା',
  copiedStatus: (email: string) => `${email} କପି ହୋଇଗଲା`,
}

export default t
