import React from "react";
import "./InfoPages.css";

const PartnerWithUs = () => {
  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Partner With Us</h1>
        <p>Join our ecosystem and help us empower the next generation of professionals.</p>
      </div>

      <div className="info-content-section">
        <h2>Our Partnership Programs</h2>
        <p>
          We work with a variety of organizations to enhance the student employment landscape. 
          Whether you're a university, a career center, or a student organization, there's a place for you here.
        </p>
        
        <div style={{ marginTop: '30px' }}>
          <div style={{ padding: '20px', borderLeft: '4px solid #a29bfe', marginBottom: '20px', backgroundColor: '#fbfaff' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2d3436' }}>University Partnerships</h3>
            <p style={{ margin: 0 }}>Integrate our job board with your career center to provide students with more opportunities.</p>
          </div>
          
          <div style={{ padding: '20px', borderLeft: '4px solid #a29bfe', marginBottom: '20px', backgroundColor: '#fbfaff' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2d3436' }}>Student Societies</h3>
            <p style={{ margin: 0 }}>Get exclusive access to career workshops and sponsorship opportunities for your members.</p>
          </div>
          
          <div style={{ padding: '20px', borderLeft: '4px solid #a29bfe', backgroundColor: '#fbfaff' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2d3436' }}>Technology Partners</h3>
            <p style={{ margin: 0 }}>Collaborate on API integrations to streamline the recruitment workflow.</p>
          </div>
        </div>
      </div>

      <div className="info-content-section" style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: '#fff' }}>
        <h2 style={{ color: '#fff' }}>Let's Build Together</h2>
        <p style={{ color: '#f1f2f6' }}>
          Interested in partnering? Fill out the form below and our partnership manager will get in touch.
        </p>
        <form style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
          <input type="text" placeholder="Organization Name" style={{ padding: '12px', borderRadius: '8px', border: 'none' }} />
          <input type="email" placeholder="Contact Email" style={{ padding: '12px', borderRadius: '8px', border: 'none' }} />
          <textarea placeholder="How would you like to partner?" rows="4" style={{ padding: '12px', borderRadius: '8px', border: 'none' }}></textarea>
          <button type="button" style={{
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#fff',
            color: '#6c5ce7',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Submit Proposal
          </button>
        </form>
      </div>
    </div>
  );
};

export default PartnerWithUs;
