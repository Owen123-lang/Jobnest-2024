import React from "react";

export default function Statistics() {
  return (
    <section className="bg-gray-100 py-10 px-10 grid grid-cols-1 md:grid-cols-3 text-center gap-6">
      <div>
        <h2 className="text-2xl font-bold">10.000+</h2>
        <p className="text-sm text-gray-600">Lowongan Terpasang</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold">1.200+</h2>
        <p className="text-sm text-gray-600">Perusahaan Aktif</p>
      </div>
      <div>
        <h2 className="text-2xl font-bold">50.000+</h2>
        <p className="text-sm text-gray-600">Talenta Terdaftar</p>
      </div>
    </section>
  );
}
