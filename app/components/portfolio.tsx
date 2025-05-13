import Link from 'next/link';

export type PortfolioLink = {
  label: string;
  url: string;
};

export type PortfolioEntry = {
  company: string;
  role: string;
  dateRange: string;
  description: string;
  links?: PortfolioLink[];
};

const portfolioEntries: PortfolioEntry[] = [
  {
    company: 'HyperPlay Labs Inc.',
    role: 'Head of Product',
    dateRange: '2024 - present',
    description: 'Web3-native game store and marketplace. Led product development, roadmap, and cross-functional coordination.',
    links: [
      { label: 'Website', url: 'https://hyperplay.xyz' },
      { label: 'GitHub', url: 'https://github.com/hyperplay-gaming' },
    ],
  },
  {
    company: 'Valist, Inc. (acquired by HyperPlay)',
    role: 'CEO, Co-founder',
    dateRange: '2020 - March 2024',
    description: 'Web3-native software deployment tooling. Raised $1MM+, led team, and managed successful acquisition.',
    links: [
      { label: 'Website', url: 'https://docs.valist.io' },
      { label: 'GitHub', url: 'https://github.com/valist-io' },
    ],
  },
  {
    company: 'Akashic Technologies LLC',
    role: 'CEO, Co-founder',
    dateRange: '2019 - Oct 2020',
    description: 'Blockchain and cyber security consulting. Delivered crypto wallet and satellite comms software.',
  },
  {
    company: '2U, Inc.',
    role: 'Senior Curriculum Engineer',
    dateRange: '2019 - 2020',
    description: 'Led Blockchain curriculum for FinTech Bootcamp at 60+ universities. Built full stack dapps for education.',
  },
  {
    company: 'Ethos.io PTE',
    role: 'Security and Full-Stack Engineer',
    dateRange: '2018 - 2019',
    description: 'Managed blockchain infra security, developed Universal Wallet, and cryptographic libraries.',
  },
  {
    company: 'MistIQ Technologies',
    role: 'Blockchain Engineer',
    dateRange: '2016 - 2018',
    description: 'Managed backend infra, node software, crypto wallet, and block explorer.',
  },
  {
    company: 'Heiwa Hosting',
    role: 'Co-founder',
    dateRange: '2016 - 2018',
    description: 'Software and infra consulting for small businesses. Built real-time web/native apps.',
  },
  {
    company: 'Textbook, LLC',
    role: 'Lead Application Developer',
    dateRange: '2015 - 2016',
    description: 'Architected and built a social network and Cordova apps with strong security.',
  },
  {
    company: 'Highmark Inc. (contracted via ComputerAid, Inc.)',
    role: 'Software Developer',
    dateRange: '2014 - 2017',
    description: 'Old school healthcare dev stuff. Full-stack development across 3 major projects using Angular.js, Node.js, and Java EE. Led RESTful API development with DB2/Oracle/Teradata.',
  },
];

type PortfolioItemProps = {
  entry: PortfolioEntry;
};

const PortfolioItem: React.FC<PortfolioItemProps> = ({ entry }) => (
  <div className="border-b border-neutral-800 pb-4">
    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-1">
      <h3 className="font-medium text-lg text-neutral-100">{entry.role}</h3>
      <span className="text-sm text-neutral-400 tabular-nums">{entry.dateRange}</span>
    </div>
    <p className="text-neutral-300 mb-2">{entry.company}</p>
    <p className="text-neutral-400 mb-2">{entry.description}</p>
    {entry.links && (
      <div className="flex flex-row gap-4">
        {entry.links.map((link, lidx) => (
          <a
            key={lidx}
            href={link.url}
            className="underline text-neutral-300 hover:opacity-80"
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
          </a>
        ))}
      </div>
    )}
  </div>
);

type PortfolioProps = {
  limit?: number;
  showMore?: boolean;
};

export const Portfolio: React.FC<PortfolioProps> = ({ limit, showMore = false }) => {
  const entries = limit ? portfolioEntries.slice(0, limit) : portfolioEntries;

  return (
    <section>
      <div className="flex flex-col gap-6">
        {entries.map((entry, idx) => (
          <PortfolioItem key={idx} entry={entry} />
        ))}
      </div>
      {showMore && (
        <div className="mt-8">
          <Link 
            href="/portfolio" 
            className="underline text-neutral-300 hover:opacity-80"
          >
            View full portfolio →
          </Link>
        </div>
      )}
    </section>
  );
}; 