import React from "react";
import Navbar from "../components/Navbar";

export default function CompanyProfil() {
  const company = {
    name: "Tech Indonesia",
    logo: "https://via.placeholder.com/150",
    industry: "Information Technology",
    size: "50-200 employees",
    location: "Jakarta, Indonesia",
    founded: "2015",
    website: "https://techindonesia.com",
    about: "Tech Indonesia is a fast-growing technology company focused on creating innovative solutions for businesses across Indonesia. We specialize in web and mobile application development, cloud infrastructure, and digital transformation services.",
    vision: "To become the leading technology solutions provider in Southeast Asia, helping businesses transform and thrive in the digital economy.",
    mission: "Delivering high-quality, affordable technology solutions that empower businesses and improve the lives of people across Indonesia."
  };

  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-start md:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Profil Perusahaan</h1>
          <div className="mt-4 md:mt-0">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Edit Profil
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden rounded-lg">
          {/* Company Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-24 w-24 rounded-md" src={company.logo} alt={company.name} />
              </div>
              <div className="ml-6">
                <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                <p className="text-sm text-gray-600">{company.industry} • {company.location}</p>
              </div>
            </div>
          </div>
          
          {/* Company Information */}
          <div className="px-6 py-5 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Industry</h3>
              <p className="mt-1 text-sm text-gray-900">{company.industry}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Company Size</h3>
              <p className="mt-1 text-sm text-gray-900">{company.size}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Founded</h3>
              <p className="mt-1 text-sm text-gray-900">{company.founded}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Website</h3>
              <p className="mt-1 text-sm text-gray-900">
                <a href={company.website} className="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">
                  {company.website}
                </a>
              </p>
            </div>
          </div>
          
          {/* About Section */}
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
            <p className="text-sm text-gray-600">{company.about}</p>
          </div>
          
          {/* Vision & Mission */}
          <div className="px-6 py-5">
            <div className="mb-5">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Vision</h3>
              <p className="text-sm text-gray-600">{company.vision}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Mission</h3>
              <p className="text-sm text-gray-600">{company.mission}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}