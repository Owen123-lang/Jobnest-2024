import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Statistics from "../components/Statistics";
import Testimonials from "../components/Testimonials";

export default function CompanyHomePage() {
  return (
    <div className="font-sans">
      <Navbar />
      <HeroSection />
      <Statistics />
      <Testimonials />
    </div>
  );
}
