export type PortfolioLink = {
  label: string;
  url: string;
};

export type Role = {
  title: string;
  dateRange: string;
  description: string;
};

export type PortfolioEntry = {
  company: string;
  roles: Role[];
  links?: PortfolioLink[];
};

export const portfolioEntries: PortfolioEntry[] = [
  {
    company: 'HyperPlay Labs Inc.',
    roles: [
      {
        title: 'Strategic Advisor',
        dateRange: 'May 2025 - present',
        description: 'Providing high-level strategic guidance on product direction and market opportunities.',
      },
      {
        title: 'Head of Product',
        dateRange: '2024 - May 2025',
        description: 'Web3-native game store and marketplace. Led product development, roadmap, and cross-functional coordination.',
      }
    ],
    links: [
      { label: 'Website', url: 'https://hyperplay.xyz' },
      { label: 'GitHub', url: 'https://github.com/hyperplay-gaming' },
    ],
  },
  {
    company: 'Valist, Inc. (acquired by HyperPlay)',
    roles: [
      {
        title: 'CEO, Co-founder',
        dateRange: '2020 - March 2024',
        description: 'Web3-native software deployment tooling. Raised $1MM+, led team, and managed successful acquisition.',
      }
    ],
    links: [
      { label: 'Website', url: 'https://docs.valist.io' },
      { label: 'GitHub', url: 'https://github.com/valist-io' },
    ],
  },
  {
    company: 'Akashic Technologies LLC',
    roles: [
      {
        title: 'CEO, Co-founder',
        dateRange: '2019 - Oct 2020',
        description: 'Blockchain and cyber security consulting. Delivered crypto wallet and satellite comms software.',
      }
    ],
  },
  {
    company: '2U, Inc.',
    roles: [
      {
        title: 'Senior Curriculum Engineer',
        dateRange: '2019 - 2020',
        description: 'Led Blockchain curriculum for FinTech Bootcamp at 60+ universities. Built full stack dapps for education.',
      }
    ],
  },
  {
    company: 'Ethos.io PTE',
    roles: [
      {
        title: 'Security and Full-Stack Engineer',
        dateRange: '2018 - 2019',
        description: 'Managed blockchain infra security, developed Universal Wallet, and cryptographic libraries.',
      }
    ],
  },
  {
    company: 'MistIQ Technologies',
    roles: [
      {
        title: 'Blockchain Engineer',
        dateRange: '2016 - 2018',
        description: 'Managed backend infra, node software, crypto wallet, and block explorer.',
      }
    ],
  },
  {
    company: 'Heiwa Hosting',
    roles: [
      {
        title: 'Co-founder',
        dateRange: '2016 - 2018',
        description: 'Software and infra consulting for small businesses. Built real-time web/native apps.',
      }
    ],
  },
  {
    company: 'Textbook, LLC',
    roles: [
      {
        title: 'Lead Application Developer',
        dateRange: '2015 - 2016',
        description: 'Architected and built a social network and Cordova apps with strong security.',
      }
    ],
  },
  {
    company: 'Highmark Inc. (contracted via ComputerAid, Inc.)',
    roles: [
      {
        title: 'Software Developer',
        dateRange: '2014 - 2017',
        description: 'Old school healthcare dev stuff. Full-stack development across 3 major projects using Angular.js, Node.js, and Java EE. Led RESTful API development with DB2/Oracle/Teradata.',
      }
    ],
  },
];


export type EducationEntry = {
  school: string;
  degree: string;
  year: string;
  description: string;
  links?: { label: string; url: string }[];
};

export const educationEntries: EducationEntry[] = [
  {
    school: 'Harrisburg University of Science and Technology',
    degree: 'Bachelor of Science (B.S.), Computer Science',
    year: '2018',
    description: 'Initially pursued a major in Cyber Security before transitioning to Computer Science. Graduated with a B.S. in Computer Science, combining security expertise with comprehensive knowledge in algorithms, data structures, systems architecture, and theoretical foundations.',
    links: [
      { label: 'Website', url: 'http://harrisburgu.edu/' },
    ],
  },
  {
    school: 'Chester County Technical College High School',
    degree: 'Computer Information Systems',
    year: '2014',
    description: 'Advanced technical education program with intensive focus on Computer Information Systems. Served as Teacher\'s Assistant under Mr. Phillip Paul Fuchs, M.S., attended for half of the day for 3 years, gaining rigorous hands-on experience in Computer Science before graduation.',
    links: [
      { label: 'CIS Program', url: 'http://cis.tchs.info/' },
      { label: 'School Website', url: 'http://www.cciu.org/tchspennocksbridge' },
      { label: 'My teacher\'s algorithm: QuickPerm', url: 'https://www.quickperm.org/' },
    ],
  },
];
