// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CompanyHomePage from "./pages/CompanyHomePage";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyPasangLowongan from "./pages/CompanyPasangLowongan";
import CompanyDaftarLowongan from "./pages/CompanyDaftarLowongan";
import CompanyDetailLowongan from "./pages/CompanyDetailLowongan";
import CompanyProfil from "./pages/CompanyProfil";
import CompanyNotifikasi from "./pages/CompanyNotifikasi";

function App() {
  return (
    <Router>
      <div>
        {/* Navigation */}
        <nav className="p-4 bg-blue-500 text-white">
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
            <li><Link to="/company-pasang-lowongan" className="hover:underline">Pasang Lowongan</Link></li>
            <li><Link to="/company-daftar-lowongan" className="hover:underline">Daftar Lowongan</Link></li>
            <li><Link to="/company-detail-lowongan" className="hover:underline">Detail Lowongan</Link></li>
            <li><Link to="/company-profil" className="hover:underline">Profil Perusahaan</Link></li>
            <li><Link to="/company-notifikasi" className="hover:underline">Notifikasi</Link></li>
          </ul>
        </nav>

        {/* Routing */}
        <Routes>
          <Route path="/" element={<CompanyHomePage />} />
          <Route path="/dashboard" element={<CompanyDashboard />} />
          <Route path="/company-pasang-lowongan" element={<CompanyPasangLowongan />} />
          <Route path="/company-daftar-lowongan" element={<CompanyDaftarLowongan />} />
          <Route path="/company-detail-lowongan" element={<CompanyDetailLowongan />} />
          <Route path="/company-profil" element={<CompanyProfil />} />
          <Route path="/company-notifikasi" element={<CompanyNotifikasi />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
