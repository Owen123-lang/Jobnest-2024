import React from 'react';
import { Link } from 'react-router-dom'; // Tambahkan import Link

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="text-xl font-bold text-white mb-4">JobNest</div>
            <p className="text-gray-300 mb-4 max-w-md">
              Platform pencari kerja terkemuka di Indonesia yang menghubungkan talenta berbakat dengan perusahaan terbaik.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">Tentang Kami</a></li>
              <li><a href="/user/search" className="text-gray-300 hover:text-white transition-colors">Lowongan Pekerjaan</a></li>
              <li><a href="/testimonials" className="text-gray-300 hover:text-white transition-colors">Testimoni</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Email: info@jobnest.id</li>
              <li className="text-gray-300">Phone: (021) 1234-5678</li>
              <li className="text-gray-300">Alamat: Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} JobNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;