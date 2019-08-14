/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/anchor-has-content */
import React from 'react';

const Footer = () => (
  <footer className="page-footer blue">
    <div className="container center">
      <div className="row">
        <div className="col l6 m6 s12">
          <h5 className="white-text">About Me</h5>
          <p className="grey-text text-lighten-4">I am an entrepreneur born in San Diego, CA, I currently reside near Philadelphia, PA. My interests outside of technology mainly revolve around nature. I hope to help make the world a better place through careful application of code, and to help improve the human experience.</p>
        </div>
        <div className="col l6 m2 s12">
          <h5 className="white-text">Connect</h5>
          <div id="connect-buttons">
            <br />
            <a className="white-text" href="https://github.com/awantoch"><i className="fab fa-github" aria-hidden="true" /></a>
            <a className="white-text" href="https://linkedin.com/in/awantoch"><i className="fab fa-linkedin" aria-hidden="true" /></a>
            <a className="white-text" href="https://medium.com/@awantoch"><i className="fab fa-medium" aria-hidden="true" /></a>
            <a className="white-text" href="mailto:alec@wantoch.net"><i className="fas fa-envelope-open-text" aria-hidden="true" /></a>
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

export default Footer;
