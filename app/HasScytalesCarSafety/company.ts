import references from './references.json';

import type { Company } from '../Collab/companies';
import type { Plate } from '../2000/deck';

export const company: Company = {
  id: 'has-scytales-car-safety',
  name: 'Has Scytàles Car Safety',
  quote: [
    'ThirdKind proposes one film for Scytàles car safety. A crash on a mountain road, told in five hundredths of a second: from impact to the police knowing exactly who is in that car.',
  ],
  observations: [],
  stories: [
    {
      title: '',
      paragraphs: [
        'Night. A mountain road. Two cars lie wrecked against the hillside, still and silent.',
        'Cut to text on screen: The average delay before emergency services are notified of a car crash is 6.2 minutes. What if it was 0.05 seconds?',
        'Cut to black.',
        'A woman gets into her car and verifies herself with her phone. The car responds: “User verified. Start driving.”',
        'A sequence of quick cuts follows: hands on the wheel, the car taking turns, and a sweeping drone shot of it moving through the landscape. It feels like just another drive.',
        'The car stops at an intersection. She looks left, then right. The road is clear, so she pulls forward.',
        'Out of nowhere, a speeding car hits her. At the moment of impact, a sharp flash fills the screen, like a spark.',
        '0.01 seconds. In extreme slow motion, the airbag unfolds.',
        '0.02 seconds. Inside the car, the driver drifts forward, barely moving.',
        '0.03 seconds. The spark races through the car’s wiring as a signal.',
        '0.04 seconds. At a police station, a notification appears on a monitor.',
        '0.05 seconds. In an extreme slow-motion tracking shot, a police officer opens his eyes and turns to the screen. It shows the driver’s name, surname, car model and other details.',
        'Cut to black.',
      ],
    },
  ],
  references: references as Plate[],
  costBook: [
    {
      title: 'Pre-production',
      lines: [
        { label: 'Locations', amount: 637 },
        { label: 'Props', amount: 468 },
        { label: 'Transportation', amount: 823 },
      ],
    },
    {
      title: 'Production',
      lines: [
        { label: 'Filming', amount: 4000 },
        { label: 'Equipment', amount: 912 },
        { label: 'Food', amount: 118 },
      ],
    },
    {
      title: 'Post-production',
      lines: [
        { label: 'Editing', amount: 1771 },
        { label: 'VFX', amount: 1011 },
      ],
    },
  ],
};
