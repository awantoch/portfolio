import React from 'react';

export type PortfolioEntry = {
  title: string;
  description: string;
  links?: { label: string; url: string }[];
};

const portfolioEntries: PortfolioEntry[] = [
  {
    title: 'HyperPlay Labs Inc.',
    description: 'Head of Product (2024 - present). Web3-native game store and marketplace. Led product development, roadmap, and cross-functional coordination.',
    links: [
      { label: 'Website', url: 'https://hyperplay.xyz' },
    ],
  },
  {
    title: 'Valist, Inc. (acquired by HyperPlay)',
    description: 'CEO, Co-founder (2020 - March 2024). Web3-native software deployment tooling. Raised $1MM+, led team, and managed successful acquisition.',
    links: [
      { label: 'Website', url: 'https://valist.io' },
      { label: 'GitHub', url: 'https://github.com/valist-io' },
    ],
  },
  {
    title: 'Akashic Technologies LLC',
    description: 'CEO, Co-founder (2019 - Oct 2020). Blockchain and cyber security consulting. Delivered crypto wallet and satellite comms software.',
  },
  {
    title: '2U, Inc.',
    description: 'Senior Curriculum Engineer (2019 - 2020). Led Blockchain curriculum for FinTech Bootcamp at 60+ universities. Built full stack dapps for education.',
  },
  {
    title: 'Ethos.io PTE',
    description: 'Security and Full-Stack Engineer (2018 - 2019). Managed blockchain infra security, developed Universal Wallet, and cryptographic libraries.',
  },
  {
    title: 'MistIQ Technologies',
    description: 'Blockchain Engineer (2016 - 2018). Managed backend infra, node software, crypto wallet, and block explorer.',
  },
  {
    title: 'Heiwa Hosting',
    description: 'Co-founder (2016 - 2018). Software and infra consulting for small businesses. Built real-time web/native apps.',
  },
  {
    title: 'Textbook, LLC',
    description: 'Lead Application Developer (2015 - 2016). Architected and built a social network and Cordova apps with strong security.',
  },
];

export function Portfolio() {
  return (
    <section className="my-8">
      <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
      <div className="flex flex-col gap-6">
        {portfolioEntries.map((entry, idx) => (
          <div key={idx} className="border-b border-neutral-800 pb-4">
            <h3 className="font-medium text-lg">{entry.title}</h3>
            <p className="text-neutral-400 mb-2">{entry.description}</p>
            {entry.links && (
              <div className="flex flex-row gap-4">
                {entry.links.map((link, lidx) => (
                  <a
                    key={lidx}
                    href={link.url}
                    className="underline text-neutral-300 hover:text-white"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
} 