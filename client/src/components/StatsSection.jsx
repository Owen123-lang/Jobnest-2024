import React from 'react';

function StatsSection() {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Job Listings */}
          <div className="p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
            <div className="text-lg font-medium text-gray-700">Active Job Listings</div>
            <p className="mt-2 text-sm text-gray-500">
              Various positions from different industries always available for you
            </p>
          </div>

          {/* Active Companies */}
          <div className="p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-blue-600 mb-2">1,200+</div>
            <div className="text-lg font-medium text-gray-700">Active Companies</div>
            <p className="mt-2 text-sm text-gray-500">
              Trusted companies looking for talented professionals like you
            </p>
          </div>

          {/* Registered Talents */}
          <div className="p-8 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
            <div className="text-lg font-medium text-gray-700">Registered Professionals</div>
            <p className="mt-2 text-sm text-gray-500">
              Join thousands of job seekers who found their dream careers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsSection;