import React, { useState, useEffect } from "react";
import homeService from "../../services/homeService";
import "./Testimonial.css";

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await homeService.getHomeData();
        if (response && response.success && response.data && response.data.testimonials) {
          setTestimonials(response.data.testimonials);
        } else {
          console.warn("Invalid response format or no testimonials found");
          setTestimonials([]);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials if there are multiple
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 8000); // Change testimonial every 8 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (loading) {
    return (
      <section className="testimonial-section">
        <h2 className="section-title">What Students Say</h2>
        <div className="testimonial-card skeleton">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-circle"></div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    // Fallback to default testimonial if no data
    return (
      <section className="testimonial-section">
        <h2 className="section-title fade-in-up">What Students Say</h2>
        <div className="testimonial-card fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="quote-icon">"</div>
          <p className="testimonial-text">
            This platform helped me find my dream internship at a tech startup.
            The process was smooth and the employers were respectful!
          </p>
          <div className="testimonial-author">
            <p className="author-name">John B.</p>
            <p className="author-title">Computer Science Student</p>
          </div>
          <div className="testimonial-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="star">⭐</span>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const currentTestimonial = testimonials[currentIndex] || testimonials[0];

  return (
    <section className="testimonial-section">
      <h2 className="section-title fade-in-up">What Students Say</h2>
      <div className="testimonial-card fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="quote-icon">"</div>
        <p className="testimonial-text">{currentTestimonial.text}</p>
        <div className="testimonial-author">
          <p className="author-name">{currentTestimonial.author_name}</p>
          <p className="author-title">{currentTestimonial.author_title}</p>
        </div>
        <div className="testimonial-rating">
          {Array.from({ length: currentTestimonial.rating || 5 }, (_, i) => (
            <span key={i} className="star">⭐</span>
          ))}
        </div>
        {testimonials.length > 1 && (
          <div className="testimonial-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonial;
