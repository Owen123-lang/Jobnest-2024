import React from "react";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-6 px-10 border-b">
      <div className="text-blue-600 font-bold text-xl">Jobnest</div>
      <ul className="flex gap-6 text-sm font-medium">
        <li className="cursor-pointer">Tentang Kami</li>
        <li className="cursor-pointer">Job Marketplace</li>
        <li className="cursor-pointer">Testimoni</li>
      </ul>
      <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded">Daftar / Masuk</button>
    </nav>
  );
}
