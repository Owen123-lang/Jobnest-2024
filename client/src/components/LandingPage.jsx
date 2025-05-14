import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import TestimonialSection from './TestimonialSection';
import Footer from './Footer';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <TestimonialSection />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;