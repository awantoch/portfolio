import React from 'react';
import trees from '../images/trees.jpg';

const Skills = () => {
    const skills = [
        { name: 'Linux', icon: 'devicon-linux-plain' },
        { name: 'C', icon: 'devicon-c-plain' },
        { name: 'Python', icon: 'devicon-python-plain' },
        { name: 'TypeScript', icon: 'devicon-typescript-plain' },
        { name: 'Node.js', icon: 'devicon-nodejs-plain' },
        { name: 'Go', icon: 'devicon-go-plain' },
        { name: 'React', icon: 'devicon-react-plain' },
        { name: 'Docker', icon: 'devicon-docker-plain' },
        { name: 'MongoDB', icon: 'devicon-mongodb-plain' },
        { name: 'PostgreSQL', icon: 'devicon-postgresql-plain' },
        { name: 'Redis', icon: 'devicon-redis-plain' },
        { name: 'AWS', icon: 'devicon-amazonwebservices-plain' },
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
                    {skills.map((skill) => {
                        return (
                            <div key={skill.icon} className="col s12 m4 l4">
                                <i className={`z-depth-5 ${skill.icon} colored tooltipped`} data-position="right" data-delay="50" data-tooltip={`${skill.name}`}></i>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="parallax">
                <img src={trees} alt="Trees looking into the sky" />
            </div>
        </div>
    );
};

export default Skills;