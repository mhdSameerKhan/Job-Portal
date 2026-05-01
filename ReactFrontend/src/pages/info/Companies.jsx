import React from "react";
import "./InfoPages.css";

const Companies = () => {
  const companies = [
    { name: "TechCorp", industry: "Technology", jobs: 12, logo: "💻" },
    { name: "GreenRetail", industry: "Retail", jobs: 8, logo: "🛍️" },
    { name: "HospitalityHub", industry: "Hospitality", jobs: 15, logo: "🏨" },
    { name: "EduGrow", industry: "Education", jobs: 5, logo: "🎓" },
    { name: "FinanceFlow", industry: "Finance", jobs: 3, logo: "💰" },
    { name: "DesignDash", industry: "Creative", jobs: 7, logo: "🎨" }
  ];

  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Top Companies Hiring Students</h1>
        <p>Explore organizations that value student talent and provide great work environments.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '40px'
      }}>
        {companies.map((company, index) => (
          <div key={index} className="info-content-section" style={{
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6c5ce7'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{company.logo}</div>
            <h3 style={{ margin: '10px 0' }}>{company.name}</h3>
            <p style={{ color: '#636e72', marginBottom: '15px' }}>{company.industry}</p>
            <div style={{
              display: 'inline-block',
              padding: '5px 15px',
              backgroundColor: '#f1f2f6',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              color: '#6c5ce7'
            }}>
              {company.jobs} Open Positions
            </div>
          </div>
        ))}
      </div>

      <div className="info-content-section" style={{ marginTop: '50px', textAlign: 'center' }}>
        <h2>Are you an Employer?</h2>
        <p>Join these leading companies and start hiring top student talent today.</p>
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
          Register Your Company
        </button>
      </div>
    </div>
  );
};

export default Companies;
