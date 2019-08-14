import React from 'react';
import paradise from '../images/paradise.jpg';

const Banner = () => (
  <div id="index-banner" className="parallax-container valign-wrapper">
    <div className="container">
      <h1>Who am I?</h1>
      <div className="row">
        <div id="daconsole">
          <h3 className="header" data-target-resolver>hmmm...</h3>
        </div>
      </div>
    </div>
    <div className="parallax">
      <img src={paradise} alt="Beautiful soothing island during sunset" />
    </div>
  </div>
);

export default Banner;
