import React from 'react';

const Experience = () => {
  const jobs = [
    {
      name: 'Ethos.io PTE',
      title: 'Security & Full Stack Engineer',
      time: 'Jan 2018 - present',
      details: [
        'Blockchain infrastructure and application security, API security and design',
        'Build developer-friendly blockchain solutions for self-custodied finance',
        'Develop and harden ”Universal Wallet” React Native mobile app',
        'Develop cryptographic library to abstract transaction generation and signing for various blockchains',
      ],
    },
    {
      name: 'MistIQ Technologies',
      title: 'Software Engineer, Infrastructure Management',
      time: 'January 2017 - January 2018',
      details: [
        'Managed infrastructure and security',
        'Developed Active Data Transformation Fabric for IoT',
        'Formalized and executed blockchain implementation R&D',
      ],
    },
    {
      name: 'Heiwa Hosting',
      title: 'Co-Founder, CISO',
      time: 'June 2016 - January 2018',
      details: [
        'Provide consulting and development of software and infrastructures to small businesses and individuals',
        'Developed real-time, cross-platform web/native applications',
        'Infrastructure security consulting',
      ],
    },
    {
      name: 'Highmark (via ComputerAid, Inc)',
      title: 'Software Engineer',
      time: 'January 2017 - January 2018',
      details: [
        'Developed internal applications and solutions to increase the scale and security of the benefits processing systems',
        'Upgraded legacy infrastructure',
        'Worked on 3 projects and participated in 3 production releases',
      ],
    },
    {
      name: 'Textbook, LLC',
      title: 'Lead Application Developer',
      time: 'September 2015 - June 2016',
      details: [
        'Architected, built, and assisted in designing a social network, as well as the cross-platform Cordova apps',
        'Implemented critical network and application security from the front-end to the back-end',
      ],
    },
  ];

  const schools = [
    {
      name: 'Harrisburg University of Science and Technology',
      degree: 'B.S. Computer Information Sciences, Computer Science',
      details: [
        'Focused on Artificial Intelligence, Cyber Security, and Software Engineering',
      ],
    },
    {
      name: 'Technical College High School (TCHS)',
      degree: 'Computer Information Systems',
      details: [
        'Attended this technical school during the second half of my days in high school from 10th through 12th grade. It was here that I quickly became teacher\'s assistant for Mr. Phillip Paul Fuchs, M.S.',
        'I studied Computer Information Systems and acquired over 1,000 hours of experience in the Computer Science field before graduation.',
      ],
    },
  ];

  return (
      <div className="valign-wrapper" style={{ minHeight: '50vh', paddingTop: '20px' }}>
          <div className="container">
              <div className="row center">
              <h5 className="header col s12 light">A brief look into my work experience</h5>
            </div>
              <div className="row">
              <ul className="collapsible" data-collapsible="accordion">
                  {jobs.map((job) => (
                            <li key={job.name}>
                                <div className="collapsible-header"><i className="material-icons">filter_drama</i>{job.name}</div>
                                <div className="collapsible-body">
                                    <h4>{job.title}</h4>
                                    <h5>{job.name}</h5>
                                    <h6>{job.time}</h6>
                                    <ul>
                                        {job.details.map((detail) => {
                                            return (
                                                <li key={detail}>- {detail}</li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>
              <div className="row center">
              <h5 className="header col s12 light">Education</h5>
            </div>
              <div className="row">
              <ul className="collapsible" data-collapsible="accordion">
                  {schools.map((school) => (
                            <li key={school.name}>
                                <div className="collapsible-header"><i className="material-icons">school</i>{school.name}</div>
                                <div className="collapsible-body">
                                    <h4>{school.degree}</h4>
                                    <ul>
                                        {school.details.map((detail) => {
                                            return (
                                                <li key={detail}>{detail}</li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            </li>
                        ))}
                </ul>
            </div>
            </div>
        </div>
  );
};

export default Experience;
