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
    description: 'Advanced technical education program with intensive focus on Computer Information Systems. Served as Teacher\'s Assistant under Mr. Phillip Paul Fuchs, M.S., while accumulating over 1,000 hours of hands-on experience in Computer Science before graduation.',
    links: [
      { label: 'CIS Program', url: 'http://cis.tchs.info/' },
      { label: 'School Website', url: 'http://www.cciu.org/tchspennocksbridge' },
      { label: 'My teacher\'s algorithm: QuickPerm', url: 'https://www.quickperm.org/' },
    ],
  },
];

export function Education() {
  return (
    <div className="flex flex-col gap-6">
      {educationEntries.map((entry, idx) => (
        <div key={idx} className="border-b border-neutral-800 pb-4">
          <h3 className="font-medium text-lg">{entry.school}</h3>
          <p className="text-neutral-400">{entry.degree} (graduated {entry.year})</p>
          <p className="text-neutral-400 mb-2">{entry.description}</p>
          {entry.links && (
            <div className="flex flex-row gap-4">
              {entry.links.map((link, lidx) => (
                <a
                  key={lidx}
                  href={link.url}
                  className="underline text-neutral-700 dark:text-neutral-300 hover:opacity-80"
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
  );
} 