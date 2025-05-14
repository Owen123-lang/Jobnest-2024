import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function CompanyHomePage() {
  const stats = [
    { label: "Active Job Listings", value: 5 },
    { label: "Total Applicants", value: 47 },
    { label: "Interviews Scheduled", value: 12 },
    { label: "New Messages", value: 3 }
  ];
  
  const recentApplicants = [
    { id: 1, name: "Budi Santoso", position: "Frontend Developer", date: "May 12, 2025", status: "New" },
    { id: 2, name: "Dian Sastro", position: "UX Designer", date: "May 11, 2025", status: "Reviewing" },
    { id: 3, name: "Agus Pranoto", position: "Backend Engineer", date: "May 10, 2025", status: "Interview" }
  ];

  return (
    <div className="font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Company Dashboard</h1>
          <Link 
            to="/company/post-job" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Post New Job
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white shadow rounded-lg p-6 border-t-4 border-blue-500"
            >
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
        
        {/* Recent Applicants */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Applicants</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Applied
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {applicant.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {applicant.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {applicant.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${applicant.status === 'New' ? 'bg-green-100 text-green-800' : 
                          applicant.status === 'Reviewing' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {applicant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">
                      <a href="#">View Details</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 text-right">
            <Link to="/company/applications" className="text-sm font-medium text-blue-600 hover:text-blue-900">
              View All Applicants →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}