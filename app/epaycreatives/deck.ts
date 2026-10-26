import type { Chapter, Credit, Plate } from '../2000/deck';

const SLEEP: Plate[] = [
  {
    src: '/epaycreatives/sleep-tight/Agnes-Varda_Le-Bonheur.jpg',
    w: 936,
    h: 575,
    alt: 'Agnes Varda, Le Bonheur',
  },
  {
    src: '/epaycreatives/sleep-tight/Alex-Bohs_3-of-30.gif',
    w: 854,
    h: 480,
    alt: 'Alex Bohs, 3 of 30',
  },
  {
    src: '/epaycreatives/sleep-tight/Ampol_Far-and-Wide.png',
    w: 1920,
    h: 800,
    alt: 'Ampol, Far and Wide',
  },
  {
    src: '/epaycreatives/sleep-tight/Bryan-Behr_Big-Bang.png',
    w: 2880,
    h: 2160,
    alt: 'Bryan Behr, Big Bang',
  },
  {
    src: '/epaycreatives/sleep-tight/COLLI-Bike_COLLI-FIitness-Continuem-se-Cuidando.png',
    w: 3240,
    h: 2160,
    alt: 'COLLI Bike, COLLI FIitness Continuem se Cuidando',
  },
  {
    src: '/epaycreatives/sleep-tight/Cart-+-Horse_Virtual-Production-Collab.gif',
    w: 1920,
    h: 1080,
    alt: 'Cart + Horse, Virtual Production Collab',
  },
  {
    src: '/epaycreatives/sleep-tight/CentrePoint_Father\u2019s-Day.gif',
    w: 1920,
    h: 804,
    alt: 'CentrePoint, Father\u2019s Day',
  },
  {
    src: '/epaycreatives/sleep-tight/Gilde_Morning-Rituals.png',
    w: 1920,
    h: 715,
    alt: 'Gilde, Morning Rituals',
  },
  {
    src: '/epaycreatives/sleep-tight/Halfords_For-All-Wheelkind.png',
    w: 1920,
    h: 1080,
    alt: 'Halfords, For All Wheelkind',
  },
  {
    src: '/epaycreatives/sleep-tight/Hyundai_Live-Loud.png',
    w: 1920,
    h: 700,
    alt: 'Hyundai, Live Loud',
  },
  {
    src: '/epaycreatives/sleep-tight/Jesse-Barrera_Supersonic.png',
    w: 3840,
    h: 2160,
    alt: 'Jesse Barrera, Supersonic',
  },
  {
    src: '/epaycreatives/sleep-tight/Komercni-Banka_Visa-X-KB.png',
    w: 3840,
    h: 2160,
    alt: 'Komercni Banka, Visa X KB',
  },
  {
    src: '/epaycreatives/sleep-tight/McDonald\u2019s_Superhero.png',
    w: 1920,
    h: 780,
    alt: 'McDonald\u2019s, Superhero',
  },
  {
    src: '/epaycreatives/sleep-tight/Mercedes-Benz_Wonderland-2.png',
    w: 1920,
    h: 1080,
    alt: 'Mercedes Benz, Wonderland 2',
  },
  {
    src: '/epaycreatives/sleep-tight/Mercedes-Benz_Wonderland.png',
    w: 1920,
    h: 1080,
    alt: 'Mercedes Benz, Wonderland',
  },
  {
    src: '/epaycreatives/sleep-tight/Mitsubishi_Outlander-2.gif',
    w: 854,
    h: 336,
    alt: 'Mitsubishi, Outlander 2',
  },
  {
    src: '/epaycreatives/sleep-tight/Mitsubishi_Outlander.gif',
    w: 852,
    h: 336,
    alt: 'Mitsubishi, Outlander',
  },
  {
    src: '/epaycreatives/sleep-tight/Nestle_Nan.png',
    w: 3840,
    h: 2160,
    alt: 'Nestle, Nan',
  },
  {
    src: '/epaycreatives/sleep-tight/OPEL_120-Years.png',
    w: 1908,
    h: 816,
    alt: 'OPEL, 120 Years',
  },
  {
    src: '/epaycreatives/sleep-tight/Publix_Merry-Birthday.gif',
    w: 854,
    h: 362,
    alt: 'Publix, Merry Birthday',
  },
  {
    src: '/epaycreatives/sleep-tight/Qi_Fawz.png',
    w: 3840,
    h: 2160,
    alt: 'Qi, Fawz',
  },
  {
    src: '/epaycreatives/sleep-tight/Visa_Connected-Card.png',
    w: 1920,
    h: 1080,
    alt: 'Visa, Connected Card',
  },
  {
    src: '/epaycreatives/sleep-tight/Visa_The-other-David-Villa.png',
    w: 1920,
    h: 1080,
    alt: 'Visa, The other David Villa',
  },
];

const TAXI: Plate[] = [
  {
    src: '/epaycreatives/taxi-driver/Alejandro-Gonzalez-Inarritu_Biutiful.jpg',
    w: 1280,
    h: 706,
    alt: 'Alejandro Gonzalez Inarritu, Biutiful',
  },
  {
    src: '/epaycreatives/taxi-driver/Ariana-Grande_Hate-That-I-Made-You-Love-Me.png',
    w: 3840,
    h: 2160,
    alt: 'Ariana Grande, Hate That I Made You Love Me',
  },
  {
    src: '/epaycreatives/taxi-driver/BAS_PentHouse-2.png',
    w: 2048,
    h: 858,
    alt: 'BAS, PentHouse 2',
  },
  {
    src: '/epaycreatives/taxi-driver/BAS_PentHouse.png',
    w: 2048,
    h: 858,
    alt: 'BAS, PentHouse',
  },
  {
    src: '/epaycreatives/taxi-driver/CSDD_CSDD-(2018).png',
    w: 1920,
    h: 800,
    alt: 'CSDD, CSDD (2018)',
  },
  {
    src: '/epaycreatives/taxi-driver/Cadillac_Indomitable.gif',
    w: 854,
    h: 358,
    alt: 'Cadillac, Indomitable',
  },
  {
    src: '/epaycreatives/taxi-driver/Claire-Denis_35-Shots-of-Rum.jpg',
    w: 852,
    h: 466,
    alt: 'Claire Denis, 35 Shots of Rum',
  },
  {
    src: '/epaycreatives/taxi-driver/Four-Seasons_New-Horizons.png',
    w: 3840,
    h: 2160,
    alt: 'Four Seasons, New Horizons',
  },
  {
    src: '/epaycreatives/taxi-driver/Gioacchino-Petronicce_LOCKED-IN.png',
    w: 1920,
    h: 800,
    alt: 'Gioacchino Petronicce, LOCKED IN',
  },
  {
    src: '/epaycreatives/taxi-driver/J.P.-Morgan_Transformers.png',
    w: 1920,
    h: 800,
    alt: 'J.P. Morgan, Transformers',
  },
  {
    src: '/epaycreatives/taxi-driver/Jean-Jacques-Beineix_Mortal-Transfer.jpg',
    w: 1020,
    h: 434,
    alt: 'Jean Jacques Beineix, Mortal Transfer',
  },
  {
    src: '/epaycreatives/taxi-driver/Jonathan-Demme_Melvin-and-Howard.jpg',
    w: 1024,
    h: 551,
    alt: 'Jonathan Demme, Melvin and Howard',
  },
  {
    src: '/epaycreatives/taxi-driver/Kofe-Espresso-Bar_Yawning.png',
    w: 1920,
    h: 1080,
    alt: 'Kofe Espresso Bar, Yawning',
  },
  {
    src: '/epaycreatives/taxi-driver/Louis-Leterrier_The-Incredible-Hulk.jpg',
    w: 1280,
    h: 544,
    alt: 'Louis Leterrier, The Incredible Hulk',
  },
  {
    src: '/epaycreatives/taxi-driver/Nike_Tough-Love.png',
    w: 2048,
    h: 870,
    alt: 'Nike, Tough Love',
  },
  {
    src: '/epaycreatives/taxi-driver/Sim-Bex_Fault-in-my-Code.png',
    w: 1440,
    h: 1080,
    alt: 'Sim Bex, Fault in my Code',
  },
  {
    src: '/epaycreatives/taxi-driver/Wego_Holidays.gif',
    w: 854,
    h: 364,
    alt: 'Wego, Holidays',
  },
];

const TIP: Plate[] = [
  {
    src: '/epaycreatives/the-tip/Allday-Goods_The-Everyday-Range.png',
    w: 1920,
    h: 1080,
    alt: 'Allday Goods, The Everyday Range',
  },
  {
    src: "/epaycreatives/the-tip/Game+_Let's-Make-It-Interesting.png",
    w: 1920,
    h: 1080,
    alt: "Game+, Let's Make It Interesting",
  },
  {
    src: '/epaycreatives/the-tip/Jeshi_Generation.png',
    w: 1590,
    h: 1080,
    alt: 'Jeshi, Generation',
  },
  {
    src: '/epaycreatives/the-tip/Ooredoo-Qatar_Go-Connect.png',
    w: 2880,
    h: 2160,
    alt: 'Ooredoo Qatar, Go Connect',
  },
  {
    src: '/epaycreatives/the-tip/Pepsi_Rockstar-Energy-Delivery.png',
    w: 1440,
    h: 1080,
    alt: 'Pepsi, Rockstar Energy Delivery',
  },
  {
    src: '/epaycreatives/the-tip/Poiison_K!ll-Switch.png',
    w: 2880,
    h: 2160,
    alt: 'Poiison, K!ll Switch',
  },
  {
    src: '/epaycreatives/the-tip/Shgardi_KSA.png',
    w: 1920,
    h: 1080,
    alt: 'Shgardi, KSA',
  },
  {
    src: '/epaycreatives/the-tip/Stash_In-Your-World.png',
    w: 4096,
    h: 2160,
    alt: 'Stash, In Your World',
  },
  {
    src: '/epaycreatives/the-tip/Szczyl_Anastazja.png',
    w: 1920,
    h: 1080,
    alt: 'Szczyl, Anastazja',
  },
  {
    src: '/epaycreatives/the-tip/Talabat_Ramadan-Requests.png',
    w: 1420,
    h: 1080,
    alt: 'Talabat, Ramadan Requests',
  },
  {
    src: '/epaycreatives/the-tip/Uniqlo_Heattech.png',
    w: 1920,
    h: 710,
    alt: 'Uniqlo, Heattech',
  },
  {
    src: '/epaycreatives/the-tip/dacia_investigation_14.png',
    w: 1920,
    h: 1080,
    alt: 'dacia, investigation, 14',
  },
];

export const chapters: Chapter[] = [
  {
    id: '01',
    title: 'epay creatives',
    blocks: [{ kind: 'lead', text: 'epay creatives' }],
  },
  {
    id: '02',
    title: '3 Films putting epay solutions at the heart of human interaction.',
    nav: '3 films',
    blocks: [
      {
        kind: 'copy',
        title:
          '3 Films putting epay solutions at the heart of human interaction.',
      },
    ],
  },
  {
    id: '03',
    title: 'Sleep Tight',
    nav: 'Sleep Tight',
    blocks: [
      {
        kind: 'copy',
        title: 'Sleep Tight',
        tag: 'Android PAS',
        body: 'A family trip seen through the eyes of a young girl slowly falling asleep. During the trip we see all the payment transactions that take place, the coffee at the village cafe, paying the tolls, paying for gas, paying for a treat for the little one. All shot from inside the car through her POV. The film ends with the girl safely in bed.',
      },
    ],
  },
  {
    id: '04',
    title: 'Sleep Tight',
    nav: 'Sleep Tight, stills',
    blocks: [{ kind: 'justified', images: SLEEP }],
  },
  {
    id: '05',
    title: 'The Taxi Driver',
    blocks: [
      {
        kind: 'copy',
        title: 'The Taxi Driver',
        tag: 'Soft POS',
        body: 'We see a man enter a taxi, it’s pouring rain outside, it’s moody but atmospheric. Driver says hello, man replies, they start talking. The driver starts telling his story.\n\n“I grew up in the Peloponnese, 1955 was the day I was born, a decade after the war, I saw my father die right in front of my own eyes, I used to walk barefoot to school and back, tough life, tough life… Then I came to Athens, made a life of my own, married the woman of my dreams, had the kids of my dreams, heck bought the car of my dreams, I never complained. Driving a taxi is not as easy as you might think… There are good times and bad times… you stay at the wheel and you keep going, that’s all you can do… isn’t it? Keep going, keep driving, keep living.”\n\nThe taxi stops. “We’re here.” The driver preps his phone for the payment. The man pays and says “You’re doing great Stelios, keep living, I’ll do the same…” Beep! He pays.\n\nThey both smile and the man exits the car and walks away. The driver smiles and turns the music up and drives off.',
      },
    ],
  },
  {
    id: '06',
    title: 'The Taxi Driver',
    nav: 'Taxi Driver, stills',
    blocks: [{ kind: 'justified', images: TAXI }],
  },
  {
    id: '07',
    title: 'The Tip',
    blocks: [
      {
        kind: 'copy',
        title: 'The Tip',
        tag: 'Soft POS',
        body: 'This is the story of a delivery guy who has the best tip day of his entire career. The whole film is a fast-paced montage of him heading from house to house delivering food. On each trip he gets tipped 1 or 2 or even 3 euros, he uses Epay to accept the tips. Until on his last delivery, the door opens he gives the food and the delivery guy says the price, the man says “and a generous tip for you, put 100”, the delivery guy types, beep, the door shuts. We cut to him driving his motorbike with a smile on his face.',
      },
    ],
  },
  {
    id: '08',
    title: 'The Tip',
    nav: 'The Tip, stills',
    blocks: [{ kind: 'justified', images: TIP }],
  },
  {
    id: '09',
    title: 'Why',
    nav: 'Why',
    blocks: [
      {
        kind: 'copy',
        title: 'Why',
        body: 'With this campaign we want to connect epay to deep emotional moments, but through everyday scenes people already know. Show the core features inside those moments, and leave a good feeling on each one.\n\nMost brands right now are going the AI route, or the generic corporate one. This puts epay forward as a company that understands its customers and values them more than anything else.',
      },
    ],
  },
  {
    id: '10',
    title: 'Similar work',
    blocks: [
      {
        kind: 'similar',
        title: 'Similar work',
        href: 'https://www.thirdkindcreative.com/work/scytales-2',
        image: {
          src: '/work/scytales-2/str-1.jpg',
          w: 5504,
          h: 3072,
          alt: 'Scytáles ID Authentication',
        },
      },
    ],
  },
];

export const credits: Credit[] = [
  {
    name: 'Goulielmos Dermon',
    role: 'Creative Director / Producer',
    url: 'thirdkindcreative.com',
    href: 'https://thirdkindcreative.com',
  },
];
