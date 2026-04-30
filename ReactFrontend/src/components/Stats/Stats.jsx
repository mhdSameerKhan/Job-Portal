import React, { useState, useEffect, useRef } from "react";
import homeService from "../../services/homeService";
import "./Stats.css";

const Stats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startAnimation, setStartAnimation] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await homeService.getHomeData();
        if (response && response.success && response.data && response.data.stats) {
          const statsData = [
            {
              value: response.data.stats.verifiedEmployers || 0,
              title: "Verified Employers",
              description: "All employers are verified to ensure significant job opportunities for students.",
              icon: "✓",
              suffix: "+"
            },
            {
              value: response.data.stats.studentFriendlyPositions || 0,
              title: "Student-Friendly Positions",
              description: "Jobs specifically designed for students with flexible schedules and valuable experience.",
              icon: "🎓",
              suffix: "+"
            },
            {
              value: response.data.stats.totalApplications || 0,
              title: "Successful Applications",
              description: "Students have successfully applied to jobs through our streamlined platform.",
              icon: "📝",
              suffix: "+"
            }
          ];
          setStats(statsData);
        } else {
          console.warn("Invalid response format or no stats found");
          // Fallback to default stats with numbers for animation
          setStats([
            {
              value: 100,
              title: "Verified Employers",
              description: "All employees are entitled to ensure significant job opportunities for students.",
              icon: "✓",
              suffix: "%"
            },
            {
              value: 5000,
              title: "Student-Friendly Positions",
              description: "Jobs specifically external for students with flexible focus and valuable experience.",
              icon: "🎓",
              suffix: "+"
            },
            {
              value: 5,
              title: "Fast Application Process",
              description: "Streamlined application process designed to improve your busy students' schedules.",
              icon: "⚡",
              suffix: " min"
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback to default stats with numbers for animation
        setStats([
          {
            value: 100,
            title: "Verified Employers",
            description: "All employees are entitled to ensure significant job opportunities for students.",
            icon: "✓",
            suffix: "%"
          },
          {
            value: 5000,
            title: "Student-Friendly Positions",
            description: "Jobs specifically external for students with flexible focus and valuable experience.",
            icon: "🎓",
            suffix: "+"
          },
          {
            value: 5,
            title: "Fast Application Process",
            description: "Streamlined application process designed to improve your busy students' schedules.",
            icon: "⚡",
            suffix: " min"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Intersection Observer to trigger animation when stats section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startAnimation) {
            setStartAnimation(true);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of the element is visible
      }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [startAnimation]);

  if (loading) {
    return (
      <section className="stats-section">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="stats-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card skeleton">
              <div className="skeleton-circle"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="stats-section" ref={statsRef}>
      <h2 className="section-title fade-in-up">Why Choose Us</h2>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            stat={stat}
            index={index}
            startAnimation={startAnimation}
          />
        ))}
      </div>
    </section>
  );
};

// Separate component for individual stat card with counting animation
const StatCard = ({ stat, index, startAnimation }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!startAnimation || isAnimating || typeof stat.value !== 'number') {
      if (typeof stat.value !== 'number') {
        setDisplayValue(stat.value);
      }
      return;
    }

    setIsAnimating(true);
    const duration = 2000; // 2 seconds
    const startValue = 0;
    const endValue = stat.value;
    const startTime = performance.now();
    startTimeRef.current = startTime;

    const animate = (currentTime) => {
      if (!startTimeRef.current) return;

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [startAnimation, stat.value, isAnimating]);

  // Format the display value
  const formatValue = (value) => {
    if (typeof value === 'number') {
      // Format with commas for thousands
      return value.toLocaleString('en-US', { 
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      });
    }
    return value;
  };

  return (
    <div
      className="stat-card fade-in-up"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="stat-icon">{stat.icon}</div>
      <h3 className="stat-value">
        {formatValue(displayValue)}
        {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
      </h3>
      <h4>{stat.title}</h4>
      <p>{stat.description}</p>
    </div>
  );
};

export default Stats;
