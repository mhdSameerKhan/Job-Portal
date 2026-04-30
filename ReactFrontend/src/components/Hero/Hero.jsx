import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title fade-in-up">
          Find Your Dream<br />
          <span className="gradient-text">Student Job</span>
        </h1>
        <p className="hero-subtitle fade-in-up" style={{ animationDelay: '0.2s' }}>
          Discover opportunities that fit your schedule and help you gain valuable experience while studying.
        </p>
        <div className="hero-buttons fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>
      <div className="hero-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </section>
  );
};

export default Hero;
