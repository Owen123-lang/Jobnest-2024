import React from "react";

export default function HeroSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-10 py-14 items-center">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          TEMUKAN TALENTA <br /> TERBAIK UNTUK <br /> PERUSAHAAN ANDA
        </h1>
        <p className="text-sm mb-4 text-gray-700">
          Platform terpercaya untuk menemukan talenta terbaik dari seluruh Indonesia
        </p>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded">
          Pasang Lowongan
        </button>
      </div>
      <div className="w-full h-64 bg-gray-300 rounded"></div>
    </section>
  );
}
