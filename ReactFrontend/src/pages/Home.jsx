import React, { useEffect } from "react";
import Hero from "../components/Hero/Hero";
import SearchBar from "../components/common/SearchBar/SearchBar";
import Filter from "../components/Filter/Filter";
import FeaturedJobs from "../components/FeaturedJobs/FeaturedJobs";
import Stats from "../components/Stats/Stats";
import Categories from "../components/Categories/Categories";
import Testimonial from "../components/Testimonial/Testimonial";
import "./Home.css";

const Homepage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="homepage">
      <Hero />
      <div className="homepage-content">
        <SearchBar />
        <Filter />
        <FeaturedJobs />
        <Stats />
        <Categories />
        <Testimonial />
      </div>
    </div>
  );
};

export default Homepage;
