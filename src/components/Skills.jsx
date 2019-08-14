import React from 'react';
import trees from '../images/trees.jpg';
import ethereum from '../images/ethereum.png';

const Skills = () => {
  const skills = [
    { name: 'Linux', icon: 'devicon-linux-plain' },
    { name: 'Docker', icon: 'devicon-docker-plain' },
    { name: 'Ethereum/Solidity', icon: 'ethereum', url: ethereum },
    { name: 'C', icon: 'devicon-c-plain' },
    { name: 'Python', icon: 'devicon-python-plain' },
    { name: 'TypeScript', icon: 'devicon-typescript-plain' },
    { name: 'Node.js', icon: 'devicon-nodejs-plain' },
    { name: 'Go', icon: 'devicon-go-plain' },
    { name: 'React', icon: 'devicon-react-plain' },
    { name: 'MongoDB', icon: 'devicon-mongodb-plain' },
    { name: 'PostgreSQL', icon: 'devicon-postgresql-plain' },
    { name: 'Gitlab CI/CD', icon: 'devicon-gitlab-plain colored' },
  ];

  return (
    <div id="skills" className="parallax-container valign-wrapper">
      <div className="container" style={{ paddingTop: '20px' }}>
        <div className="row center">
          <div className="card-panel z-depth-5">
            <h5 className="black-text thin">HERE ARE SOME OF MY SKILLS</h5>
          </div>
        </div>
        <div id="skills-icons" className="row center">
          {skills.map((skill) => (
            <div key={skill.icon} className="col s12 m4 l4">
              <div className="skill-icon z-depth-5">
                {skill.url
                  ? <img src={skill.url} className="colored tooltipped" data-position="right" data-delay="50" data-tooltip={`${skill.name}`} alt="eth" />
                  : <i className={`${skill.icon} colored tooltipped`} data-position="right" data-delay="50" data-tooltip={`${skill.name}`} />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="parallax">
        <img src={trees} alt="Trees looking into the sky" />
      </div>
    </div>
  );
};

export default Skills;
