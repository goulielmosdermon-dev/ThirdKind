import references from './references.json';

import type { Company } from '../Collab/companies';

export const company: Company = {
  id: 'crediabank',
  name: 'CrediaBank',
  quote: [
    'ThirdKind proposes a short film for CrediaBank’s «Σπίτι μου ΙΙΙ» campaign. In extreme slow motion, an exhausted tennis player misses twice and finally lands his third shot. His courtside celebration sets up a second win when he checks his phone and sees that his home loan has been approved.',
  ],
  proposalImage: {
    src: '/crediabank/references/amica-go-together-2.webp',
    alt: 'A tennis player lies on the court and looks up',
    w: 2560,
    h: 1440,
  },
  observations: [],
  stories: [
    {
      title: '3η και τυχερή!',
      screenplay: true,
      paragraphs: [
        '**EXT. TENNIS COURT. DAY. EXTREME SLOW MOTION.**',
        'A tennis player lies flat on his back on a sunlit hard court. Dozens of balls lie scattered around him. His chest rises and falls beneath a cream polo with a rust-striped collar. He wears short white tennis shorts and a faded terrycloth headband that barely holds back his thick, rounded Afro. He has a peculiar, expressive face. Even exhausted, one eyebrow sits a little higher than the other.',
        'A ball drops into frame and bounces inches from his cheek. Only his eyes move.',
        '**VO**\n«Την πρώτη, ούτε που ασχολήθηκες…»',
        'The ball bounces away. Another lost point.',
        '**CUT TO:** Knees bend. Fingers tighten around a racket handle. A bead of sweat slips past his headband and into his eye. He blinks.',
        '**VO**\n«Τη δεύτερη, ήσουν πιο έτοιμος…»',
        'The incoming ball turns slowly enough for us to follow its white seam. It lands inside the line and kicks up dust.',
        '**VO**\n«…αλλά έκανες την κίνηση λίγο αργά.»',
        'He holds his follow-through. His eyes drift towards the spot where the ball and the strings should have met. His shoulders drop.',
        '**CUT TO:** Same player. Same angle. This time, he’s already on his toes. His grip is firm. Sunlight catches the sweat on his brow. The camera circles him as he turns his shoulders, eyes fixed on the spinning ball.',
        '**VO**\n«Μήπως η τρίτη είναι η τυχερή σου;»',
        'He swings. For an instant, the ball flattens against the strings. It clears the net and lands just inside the far baseline.',
        '**It’s in.**',
        'A huge grin breaks across his face. He leaps, fist raised, sweat flying from his Afro. We hold him at the top of the jump, celebrating a single forehand like he’s just won Wimbledon.',
        '**MEDIUM SHOT:** A moment later, he’s sitting on the courtside bench, racket beside him, looking at his phone. His thumb stops mid-scroll. One eyebrow lifts. Then that grin comes back. He reads the message: **«Σπίτι μου ΙΙΙ»**.',
        '**«Το δάνειό σου εγκρίθηκε.»**',
        '**END CARD**\nΠρόγραμμα «Σπίτι μου ΙΙΙ»,\nμε την υποστήριξη της CrediaBank.',
        '**CrediaBank. Η τράπεζά σου.**',
      ],
    },
  ],
  why: 'Tennis feels familiar and fits a story about giving it another shot. An exhausted player lying on the court, with a ball bouncing inches from his face, is a hook from the first frame. In extreme slow motion, the spinning ball and the moment it hits the strings look spectacular. Tennis rewards persistence, so when that third shot finally lands, the victory feels earned. We carry that feeling into the final moment, when he learns his home loan has been approved. A blue tennis court would bring CrediaBank’s colours into every shot and give us room to work with different camera angles in one location. The court gives us a ready-made set, and shooting in daylight keeps the lighting setup simple.',
  references,
  costBookTitle: 'Budget',
  collapseCostBook: true,
  costBook: [
    {
      title: 'Film costs',
      lines: [
        { label: 'Production management fee', amount: 1850 },
        { label: 'Director’s fee', amount: 2000 },
        { label: 'DoP fee', amount: 2000 },
        { label: 'Equipment', amount: 2000 },
        { label: 'Crew', amount: 3200 },
        { label: 'Cast fee (to be confirmed)', amount: 500 },
        { label: 'Outfit (to be confirmed)', amount: 160 },
        { label: 'Locations (to be confirmed)', amount: 1000 },
        { label: 'Hair and makeup (HMU)', amount: 250 },
        { label: 'Contingency', amount: 400 },
        { label: 'Post-production fee (including all formats)', amount: 2500 },
      ],
    },
  ],
};
