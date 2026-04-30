import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import homeService from "../../services/homeService";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await homeService.getHomeData();
        if (response && response.success && response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          console.warn("Invalid response format or no categories found");
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to empty array - let the component handle empty state
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/jobs?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <section className="categories-section">
        <h2 className="section-title">Browse by Category</h2>
        <div className="categories-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="category-card skeleton">
              <div className="skeleton-circle"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="categories-section">
        <h2 className="section-title">Browse by Category</h2>
        <p className="no-data">No categories available at the moment.</p>
      </section>
    );
  }

  return (
    <section className="categories-section">
      <h2 className="section-title fade-in-up">Browse by Category</h2>
      <div className="categories-grid">
        {categories.map((category, index) => (
          <div
            key={index}
            className="category-card fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleCategoryClick(category.name)}
          >
            <div className="category-icon">{category.icon || "📁"}</div>
            <h3>{category.jobs} jobs</h3>
            <p>{category.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
