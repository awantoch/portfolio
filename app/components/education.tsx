export type EducationEntry = {
  school: string;
  degree: string;
  year: string;
  description: string;
  links?: { label: string; url: string }[];
};

const educationEntries: EducationEntry[] = [
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

type EducationItemProps = {
  entry: EducationEntry;
};

const EducationItem: React.FC<EducationItemProps> = ({ entry }) => (
  <div className="border-b border-neutral-800 pb-4">
    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-1">
      <h3 className="font-medium text-lg text-neutral-100">{entry.degree}</h3>
      <span className="text-sm text-neutral-300 tabular-nums">{entry.year}</span>
    </div>
    <p className="text-neutral-300 mb-2">{entry.school}</p>
    <p className="text-neutral-300 mb-2">{entry.description}</p>
    {entry.links && (
      <div className="flex flex-row gap-4">
        {entry.links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            className="underline text-neutral-300 hover:opacity-80 interactive-soft"
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

export function Education() {
  return (
    <section>
      <div className="flex flex-col gap-6">
        {educationEntries.map((entry, idx) => (
          <EducationItem key={idx} entry={entry} />
        ))}
      </div>
    </section>
  );
} 