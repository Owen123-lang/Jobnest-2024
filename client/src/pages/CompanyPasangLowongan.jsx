import React from "react";
import Navbar from "../components/Navbar";

export default function CompanyPasangLowongan() {
  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pasang Lowongan Kerja</h1>
        
        <div className="bg-white shadow rounded-lg overflow-hidden" >
          <div className="p-6">
            <form>
              {/* Job Details Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4" >Detail Lowongan</h2>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 text-left">
                      Judul Pekerjaan <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="jobTitle"
                        id="jobTitle"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Contoh: Senior Frontend Developer"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 text-left">
                      Departemen
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="department"
                        id="department"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Contoh: Engineering"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 text-left">
                      Jenis Pekerjaan <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="jobType"
                        name="jobType"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">Pilih jenis pekerjaan</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 text-left">
                      Lokasi <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="location"
                        id="location"
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Contoh: Jakarta (On-site) atau Remote"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 text-left">
                      Gaji Minimum
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="salaryMin"
                        id="salaryMin"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Contoh: 10000000"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 text-left">
                      Gaji Maximum
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="salaryMax"
                        id="salaryMax"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Contoh: 15000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Deskripsi dan Persyaratan</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-left">
                      Deskripsi Pekerjaan <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Deskripsikan posisi pekerjaan, tanggung jawab, dan kualifikasi yang dibutuhkan"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 text-left">
                      Persyaratan <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="requirements"
                        name="requirements"
                        rows={4}
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Tuliskan persyaratan dan kualifikasi yang dibutuhkan (pendidikan, pengalaman, keahlian, dll)"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 text-left">
                      Benefit
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="benefits"
                        name="benefits"
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Tuliskan benefit yang ditawarkan (asuransi kesehatan, remote work, flexible hours, dll)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Simpan Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Publikasikan Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}