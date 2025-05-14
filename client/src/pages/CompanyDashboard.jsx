import React from "react";
import Navbar from "../components/Navbar";

export default function CompanyDashboard() {
  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900">Company Dashboard</h1>
        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-medium text-gray-900">Welcome to your dashboard</h2>
            <p className="mt-2 text-gray-600">
              Manage your job listings, view applications, and update your company profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}