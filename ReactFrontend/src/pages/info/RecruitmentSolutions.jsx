import React from "react";
import "./InfoPages.css";

const RecruitmentSolutions = () => {
  const solutions = [
    {
      title: "Campus Recruiting",
      desc: "Direct access to local universities and colleges to find fresh talent right where they are.",
      icon: "🏫"
    },
    {
      title: "Skill-Based Matching",
      desc: "Our AI-driven matching system ensures candidates have the specific skills you require.",
      icon: "🎯"
    },
    {
      title: "Brand Awareness",
      desc: "Showcase your company culture and values to attract the best student talent.",
      icon: "💎"
    },
    {
      title: "Streamlined Interviewing",
      desc: "Use our built-in tools to schedule and manage interviews effortlessly.",
      icon: "📅"
    }
  ];

  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Recruitment Solutions</h1>
        <p>Modern tools and strategies to help you build your future workforce.</p>
      </div>

      <div className="info-content-section" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <h2 style={{ display: 'block' }}>Why Choose StudentJobs?</h2>
        <p style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          We bridge the gap between academic theory and professional practice. Our platform is designed 
          specifically for the unique needs of student hiring, making it faster and easier to find reliable talent.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px'
        }}>
          {solutions.map((s, i) => (
            <div key={i} style={{ padding: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{s.icon}</div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{s.title}</h4>
              <p style={{ fontSize: '0.9rem', color: '#636e72' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="info-content-section">
        <h2>Custom Enterprise Solutions</h2>
        <p>
          Need something more specific? We offer custom integrations and dedicated hiring campaigns 
          for large organizations looking to scale their student recruitment efforts.
        </p>
        <button style={{
          padding: '12px 30px',
          backgroundColor: '#6c5ce7',
          color: '#fff',
          border: 'none',
          borderRadius: '30px',
          fontWeight: 'bold',
          marginTop: '20px',
          cursor: 'pointer'
        }}>
          Talk to an Expert
        </button>
      </div>
    </div>
  );
};

export default RecruitmentSolutions;
