import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import TestimonialSection from './components/TestimonialSection';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import LoginUser from './components/LoginUser';
import LoginCompany from './components/LoginCompany';
import RegisterUser from './components/RegisterUser';
import RegisterCompany from './components/RegisterCompany';
import RoleSelector from './components/RoleSelector';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/choose-role" element={<RoleSelector />} />
      <Route path="/login" element={<RoleSelector type="login" />} />
      <Route path="/login/user" element={<LoginUser />} />
      <Route path="/login/company" element={<LoginCompany />} />
      <Route path="/register" element={<RoleSelector type="register" />} />
      <Route path="/register/user" element={<RegisterUser />} />
      <Route path="/register/company" element={<RegisterCompany />} />
    </Routes>
  );
}

export default App;
