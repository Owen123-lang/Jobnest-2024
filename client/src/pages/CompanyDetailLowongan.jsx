import React from "react";
import Navbar from "../components/Navbar";

export default function CompanyDetailLowongan() {
  const jobDetails = {
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Jakarta (On-site)",
    employmentType: "Full-time",
    salary: "Rp 15.000.000 - Rp 25.000.000 per month",
    postedDate: "May 5, 2025",
    applicants: 15,
    description: "We are looking for an experienced Frontend Developer who is proficient with React.js to join our engineering team. The ideal candidate has a strong understanding of web technologies and is passionate about creating intuitive user experiences.",
    responsibilities: [
      "Develop new user-facing features using React.js",
      "Build reusable components for future use",
      "Optimize components for maximum performance",
      "Collaborate with back-end developers and web designers",
      "Troubleshoot and debug applications"
    ],
    requirements: [
      "3+ years of experience with React.js",
      "Strong proficiency in JavaScript, HTML, and CSS",
      "Experience with Redux or other state management libraries",
      "Familiarity with RESTful APIs",
      "Understanding of Git version control",
      "Bachelor's degree in Computer Science or related field (or equivalent experience)"
    ]
  };

  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">{jobDetails.title}</h1>
          <div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mr-3">
              Edit Lowongan
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
              Hapus Lowongan
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="mt-1 text-sm text-gray-900">{jobDetails.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 text-sm text-gray-900">{jobDetails.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employment Type</p>
                <p className="mt-1 text-sm text-gray-900">{jobDetails.employmentType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Salary Range</p>
                <p className="mt-1 text-sm text-gray-900">{jobDetails.salary}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Posted Date</p>
                <p className="mt-1 text-sm text-gray-900">{jobDetails.postedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applicants</p>
                <p className="mt-1 text-sm text-gray-900">{jobDetails.applicants}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Job Description</h2>
            <p className="mt-2 text-sm text-gray-600">{jobDetails.description}</p>
          </div>

          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Responsibilities</h2>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
              {jobDetails.responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="px-6 py-5">
            <h2 className="text-lg font-medium text-gray-900">Requirements</h2>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
              {jobDetails.requirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}