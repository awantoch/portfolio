import React from 'react';
import brain from '../images/brain.jpg';

const Minds = () => {
    return (
        <div className="parallax-container valign-wrapper" style={{ height: '100vh' }}>
            <div className="container center" style={{ background: 'rgba(0, 0, 0, 0.7)', width: '100vw' }}>
                <h4 className="header light">Let's connect our minds and accomplish something great together</h4>
            </div>
            <div className="parallax"><img src={brain} alt="Creative and Logical brain" /></div>
        </div>
    );
};

export default Minds;