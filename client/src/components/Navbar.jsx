import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isVisible, setIsVisible] = useState(false);

  const showNavbar = () => {
    setIsVisible(true);
  };

  const hideNavbar = () => {
    setIsVisible(false);
  };

  return (
    <>
      {/* Hover zone - area to trigger navbar */}
      <div 
        className="hover-zone fixed top-0 left-0 w-full h-10 z-40" 
        onMouseEnter={showNavbar}
      />

      {/* Navbar that appears on hover */}
      <nav 
        className={`fixed top-0 left-0 w-full bg-white shadow-md z-30 
                   transition-all duration-300 ease-in-out
                   ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}
        onMouseEnter={showNavbar}
        onMouseLeave={hideNavbar}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-blue-600">JobNest</Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About Us
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
                Job Listings
              </Link>
              <Link to="/testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">
                Testimonials
              </Link>
            </div>
            
            {/* Register/Login Button */}
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;