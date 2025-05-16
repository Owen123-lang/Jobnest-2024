import React from 'react';

const UserLamaran = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-md p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-4xl font-bold text-gray-600">
            {/* Placeholder untuk foto profil */}
            <span>N</span>
          </div>
          <h2 className="text-xl font-bold mt-4">Nama Orang</h2>
          <p className="text-gray-600">nama@example.com</p>
        </div>
        <ul className="space-y-4">
          <li className="flex items-center space-x-2 text-blue-600 font-semibold">
            <i className="fas fa-user"></i>
            <span>Profil</span>
          </li>
          <li className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <i className="fas fa-file-alt"></i>
            <span>Lamaran Saya</span>
          </li>
          <li className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <i className="fas fa-heart"></i>
            <span>Favorit</span>
          </li>
          <li className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <i className="fas fa-bell"></i>
            <span>Notifikasi</span>
          </li>
          <li className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
            <i className="fas fa-sign-out-alt"></i>
            <span>Keluar</span>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-10">
        <h1 className="text-3xl font-bold mb-6">Profil</h1>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Nama Orang"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">Email</label>
            <input
              type="email"
              placeholder="nama@example.com"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">Nomor Telepon</label>
            <input
              type="text"
              placeholder="Nomor Telepon"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">Tentang Saya</label>
            <textarea
              placeholder="Tulis Tentang Saya Disini"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows="4"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLamaran;