import React from "react";
import "./InfoPages.css";

const CareerAdvice = () => {
  const articles = [
    {
      title: "How to Balance Work and Study",
      category: "Time Management",
      excerpt: "Finding the sweet spot between your academic responsibilities and your part-time job is crucial for success...",
      icon: "📚"
    },
    {
      title: "Writing a CV with No Experience",
      category: "Resume Tips",
      excerpt: "Everyone starts somewhere. Learn how to highlight your transferable skills and academic achievements...",
      icon: "✍️"
    },
    {
      title: "Nailing Your First Interview",
      category: "Interview Prep",
      excerpt: "Prepare for common interview questions and learn how to present your best self to potential employers...",
      icon: "🤝"
    },
    {
      title: "Understanding Your Employment Rights",
      category: "Legal",
      excerpt: "As a student worker, you have specific rights. Make sure you know what they are before you start your job...",
      icon: "⚖️"
    }
  ];

  return (
    <div className="info-page-container">
      <div className="info-page-header">
        <h1>Career Advice</h1>
        <p>Expert tips and tricks to help you navigate your student career journey.</p>
      </div>

      <div className="career-advice-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginTop: '40px'
      }}>
        {articles.map((article, index) => (
          <div key={index} className="info-content-section" style={{
            margin: 0,
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{article.icon}</div>
            <span style={{ 
              backgroundColor: '#a29bfe', 
              color: '#fff', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '15px',
              display: 'inline-block'
            }}>
              {article.category}
            </span>
            <h3 style={{ color: '#2d3436', margin: '10px 0' }}>{article.title}</h3>
            <p style={{ color: '#636e72', fontSize: '0.95rem' }}>{article.excerpt}</p>
            <button style={{
              background: 'none',
              border: 'none',
              color: '#6c5ce7',
              fontWeight: 'bold',
              padding: 0,
              cursor: 'pointer',
              marginTop: '15px',
              display: 'flex',
              alignItems: 'center'
            }}>
              Read More <span style={{ marginLeft: '8px' }}>→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerAdvice;
