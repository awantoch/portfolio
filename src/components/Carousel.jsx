import React from 'react';

const Carousel = () => {
  const skills = [
    { name: 'Collaborative', icon: 'group', detail: 'I add value to teams by being highly communicative and supportive of development and team morale. I take a holistic approach to delivering a product or service to ensure the best work is done.' },
    { name: 'Fresh Approach', icon: 'refresh', detail: 'The tools you pick can drastically affect your velocity. I make sure to stay current on the latest practices and continuously seek to improve workflows.' },
    { name: 'Flexible', icon: 'timeline', detail: 'No matter what programming language, framework, stack, or environment, I can solve the problem and accomplish the end goal. I am also highly effective in remote, asynchronous roles.' },
  ];

  return (
    <div className="container">
      <div className="section">
        <div className="row">
          {skills.map((skill) => (
            <div key={skill.icon} className="col s12 m4">
              <div className="icon-block center">
                <h2 className="brown-text"><i className="material-icons">{skill.icon}</i></h2>
                <h5>{skill.name}</h5>
                <p className="light">{skill.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
