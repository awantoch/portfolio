import React from 'react';
import me from '../images/me.jpg';

const Footer = () => {
    return (
        <footer className="page-footer blue">
            <div className="container center">
                <div className="row">
                    <div className="col l3 m4 s12">
                        <img id="me" className="materialboxed" data-caption="Professional picture of me, huh..." src={me} />
                    </div>
                    <div className="col l6 m6 s12">
                        <h5 className="white-text">About Me</h5>
                        <p className="grey-text text-lighten-4">I am a young entrepreneur born in San Diego, CA. I currently reside in Harrisburg, PA. My interests outside of technology mainly revolve around nature. I hope to help make the world a better place through careful application of code, and to help improve the human experience.</p>
                    </div>
                    <div className="col l3 m2 s12">
                        <h5 className="white-text">Connect</h5>
                        <div id="connect-buttons">
                            <a className="white-text" href="https://github.com/awantoch"><i className="fab fa-github" aria-hidden="true"></i></a>
                            <a className="white-text" href="https://linkedin.com/in/awantoch"><i className="fab fa-linkedin" aria-hidden="true"></i></a>
                            <br/>
                            <a className="white-text" href="https://medium.com/@awantoch"><i className="fab fa-medium" aria-hidden="true"></i></a>
                            <a className="white-text" href="skype:awantoch1?chat"><i className="fab fa-skype" aria-hidden="true"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-copyright">
                <div className="container">
                    Made with love
                </div>
            </div>
        </footer>
    );
};

export default Footer;