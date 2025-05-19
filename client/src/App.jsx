import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginUser from './components/LoginUser';
import LoginCompany from './components/LoginCompany';
import LoginCompanyAdmin from './components/LoginCompanyAdmin';
import RegisterUser from './components/RegisterUser';
import RegisterCompany from './components/RegisterCompany';
import RegisterCompanyAdmin from './components/RegisterCompanyAdmin';
import RoleSelector from './components/RoleSelector';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyDaftarLowongan from './pages/CompanyDaftarLowongan';
import CompanyDetailLowongan from './pages/CompanyDetailLowongan';
import CompanyJobApplicants from './pages/CompanyJobApplicants';
import CompanyHomePage from './pages/CompanyHomePage';
import CompanyNotifikasi from './pages/CompanyNotifikasi';
import CompanyPasangLowongan from './pages/CompanyPasangLowongan';
import CompanyProfil from './pages/CompanyProfil';
import UserJobDetails from './pages/UserJobDetails';
import UserNotifikasi from './pages/UserNotifikasi';
import UserFavorit from './pages/UserFavorit';
import './App.css';
import UserPencarianLowongan from './pages/UserPencarianLowongan'; 
import JobDetails from './pages/JobDetails'; 
import UserProfile from './pages/UserProfile';
import UserLamaran from './pages/UserLamaran';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth Routes */}
      <Route path="/choose-role" element={<RoleSelector />} />
      <Route path="/login" element={<RoleSelector type="login" />} />
      <Route path="/login/user" element={<LoginUser />} />
      <Route path="/login/company" element={<LoginCompany />} />
      <Route path="/login/company-admin" element={<LoginCompanyAdmin />} />
      <Route path="/register" element={<RoleSelector type="register" />} />
      <Route path="/register/user" element={<RegisterUser />} />
      <Route path="/register/company" element={<RegisterCompany />} />
      <Route path="/register/company-admin" element={<RegisterCompanyAdmin />} />
      <Route path="/jobs/:id" element={<JobDetails />} /> {/* Route untuk detail pekerjaan */}
      
      
      
      {/* Company Routes */}
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
      <Route path="/company/home" element={<CompanyHomePage />} />
      <Route path="/company/lowongan" element={<CompanyDaftarLowongan />} />
      <Route path="/company/lowongan/:id" element={<CompanyDetailLowongan />} />
      <Route path="/company/job/:jobId/applicants" element={<CompanyJobApplicants />} />
      <Route path="/company/post-job" element={<CompanyPasangLowongan />} />
      <Route path="/company/notifikasi" element={<CompanyNotifikasi />} />
      <Route path="/company/profil" element={<CompanyProfil />} />

      {/* User Routes */}
      <Route path="/user/job-details/:id" element={<UserJobDetails />} />
      <Route path="/user/notifikasi" element={<UserNotifikasi />} />
      <Route path="/user/favorites" element={<UserFavorit />} />
      <Route path="/user/profile" element={<UserProfile />} />
      <Route path="/user/lamaran" element={<UserLamaran />} />
      <Route path="/user/search" element={<UserPencarianLowongan/>} /> {/* Route untuk BrowseJobs */}
      

    </Routes>
  );
}

export default App;
