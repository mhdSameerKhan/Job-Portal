import React from "react";
import "./InfoPages.css";

const SalaryGuide = () => {
  const salaries = [
    { role: "Retail Assistant", range: "£10.50 - £12.50 / hr", demand: "High" },
    { role: "Tutor", range: "£15.00 - £25.00 / hr", demand: "Medium" },
    { role: "Hospitality Staff", range: "£10.42 - £13.00 / hr", demand: "Very High" },
    { role: "Admin Assistant", range: "£11.00 - £14.00 / hr", demand: "Medium" },
    { role: "Delivery Rider", range: "£10.50 - £15.00 / hr", demand: "High" },
    { role: "Freelance Designer", range: "£15.00 - £30.00 / hr", demand: "Low" }
  ];

  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Salary Guide 2025</h1>
        <p>Understand your earning potential as a student in the current market.</p>
      </div>

      <div className="info-content-section">
        <h2>Typical Hourly Rates</h2>
        <p>
          Student pay varies significantly by industry, location, and experience level. 
          Here's a breakdown of common roles and their average hourly rates.
        </p>
        
        <div style={{ overflowX: 'auto', marginTop: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #a29bfe' }}>
                <th style={{ padding: '15px' }}>Job Role</th>
                <th style={{ padding: '15px' }}>Hourly Range</th>
                <th style={{ padding: '15px' }}>Market Demand</th>
              </tr>
            </thead>
            <tbody>
              {salaries.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{s.role}</td>
                  <td style={{ padding: '15px', color: '#6c5ce7', fontWeight: 'bold' }}>{s.range}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      backgroundColor: s.demand === 'High' || s.demand === 'Very High' ? '#e1f5fe' : '#f5f5f5',
                      color: s.demand === 'High' || s.demand === 'Very High' ? '#0288d1' : '#757575'
                    }}>
                      {s.demand}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="info-content-section">
        <h2>Key Factors Influencing Salary</h2>
        <ul>
          <li><strong>Location:</strong> Major cities like London or New York often pay higher rates to compensate for the cost of living.</li>
          <li><strong>Skill Level:</strong> Specialized skills in coding, design, or languages can command significantly higher premiums.</li>
          <li><strong>Shift Timing:</strong> Working nights, weekends, or bank holidays often qualifies for "premium pay" or higher hourly rates.</li>
          <li><strong>Age:</strong> In some jurisdictions, minimum wage varies based on your age bracket.</li>
        </ul>
      </div>
    </div>
  );
};

export default SalaryGuide;
