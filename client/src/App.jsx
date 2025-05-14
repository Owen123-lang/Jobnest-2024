import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginUser from './components/LoginUser';
import LoginCompany from './components/LoginCompany';
import RegisterUser from './components/RegisterUser';
import RegisterCompany from './components/RegisterCompany';
import RoleSelector from './components/RoleSelector';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyDaftarLowongan from './pages/CompanyDaftarLowongan';
import CompanyDetailLowongan from './pages/CompanyDetailLowongan';
import CompanyHomePage from './pages/CompanyHomePage';
import CompanyNotifikasi from './pages/CompanyNotifikasi';
import CompanyPasangLowongan from './pages/CompanyPasangLowongan';
import CompanyProfil from './pages/CompanyProfil';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes */}
      <Route path="/choose-role" element={<RoleSelector />} />
      <Route path="/login" element={<RoleSelector type="login" />} />
      <Route path="/login/user" element={<LoginUser />} />
      <Route path="/login/company" element={<LoginCompany />} />
      <Route path="/register" element={<RoleSelector type="register" />} />
      <Route path="/register/user" element={<RegisterUser />} />
      <Route path="/register/company" element={<RegisterCompany />} />
      
      {/* Company Routes */}
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
      <Route path="/company/home" element={<CompanyHomePage />} />
      <Route path="/company/lowongan" element={<CompanyDaftarLowongan />} />
      <Route path="/company/lowongan/:id" element={<CompanyDetailLowongan />} />
      <Route path="/company/post-job" element={<CompanyPasangLowongan />} />
      <Route path="/company/notifikasi" element={<CompanyNotifikasi />} />
      <Route path="/company/profil" element={<CompanyProfil />} />
    </Routes>
  );
}

export default App;
