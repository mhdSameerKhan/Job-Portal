import React from "react";
import "./InfoPages.css";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      features: ["Post 1 Job", "Basic Candidate Search", "Standard Support", "Email Notifications"],
      cta: "Get Started",
      highlight: false
    },
    {
      name: "Professional",
      price: "$49",
      period: "/month",
      features: ["Post 10 Jobs", "Advanced Filters", "Priority Support", "Featured Listings", "Direct Messaging"],
      cta: "Choose Professional",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: ["Unlimited Jobs", "Dedicated Manager", "API Access", "Custom Branding", "Bulk Candidate Export"],
      cta: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>Choose the plan that's right for your recruitment needs.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        marginTop: '40px'
      }}>
        {plans.map((plan, index) => (
          <div key={index} className="info-content-section" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: plan.highlight ? '2px solid #6c5ce7' : '1px solid #eee',
            position: 'relative'
          }}>
            {plan.highlight && (
              <span style={{
                position: 'absolute',
                top: '-15px',
                backgroundColor: '#6c5ce7',
                color: '#fff',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                MOST POPULAR
              </span>
            )}
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{plan.name}</h3>
            <div style={{ margin: '20px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{plan.price}</span>
              {plan.period && <span style={{ color: '#636e72' }}>{plan.period}</span>}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, width: '100%', marginBottom: '30px' }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{ 
                  padding: '10px 0', 
                  borderBottom: '1px solid #f9f9f9',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ color: '#00b894', marginRight: '10px' }}>✓</span> {feature}
                </li>
              ))}
            </ul>
            <button style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: plan.highlight ? '#6c5ce7' : '#f1f2f6',
              color: plan.highlight ? '#fff' : '#2d3436',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
