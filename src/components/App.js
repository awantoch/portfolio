import React from 'react';
import Banner from './Banner';
import Carousel from './Carousel';
import Skills from './Skills';
import Experience from './Experience';
import Minds from './Minds';
import Contact from './Contact';
import Footer from './Footer';

const App = () => {
  return (
    <div className="App">
      <Banner />
      <Carousel />
      <Skills />
      <Experience />
      <Minds />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
