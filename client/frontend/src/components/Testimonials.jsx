import React from "react";

export default function Testimonials() {
  return (
    <section className="py-12 px-10">
      <h3 className="text-xl font-bold mb-6">Apa Kata Mereka?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-200 p-6 rounded">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
            <div>
              <p className="text-sm font-bold">Nama Orang</p>
              <p className="text-xs text-gray-600">Pekerjaan</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">
            "Berkat Jobnest, saya diterima di perusahaan impian saya."
          </p>
        </div>
        <div className="bg-gray-200 p-6 rounded"></div>
        <div className="bg-gray-200 p-6 rounded"></div>
      </div>
    </section>
  );
}
