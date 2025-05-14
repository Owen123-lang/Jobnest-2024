import React from "react";
import Navbar from "../components/Navbar";

export default function CompanyNotifikasi() {
  const notifications = [
    {
      id: 1,
      type: "application",
      content: "Budi Santoso telah melamar posisi Frontend Developer",
      time: "5 menit yang lalu",
      read: false
    },
    {
      id: 2,
      type: "message",
      content: "Dian Sastro mengirim pesan tentang posisi UX Designer",
      time: "1 jam yang lalu",
      read: false
    },
    {
      id: 3,
      type: "system",
      content: "Premium plan Anda akan berakhir dalam 3 hari",
      time: "5 jam yang lalu",
      read: false
    },
    {
      id: 4,
      type: "application",
      content: "Agus Pranoto telah melamar posisi Backend Engineer",
      time: "1 hari yang lalu",
      read: true
    },
    {
      id: 5,
      type: "system",
      content: "Lowongan UX Designer Anda telah ditayangkan",
      time: "2 hari yang lalu",
      read: true
    }
  ];

  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Notifikasi</h1>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Tandai semua sudah dibaca
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {notifications.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li 
                  key={notification.id}
                  className={`p-4 ${!notification.read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {notification.type === 'application' && (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      {notification.type === 'message' && (
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                      )}
                      {notification.type === 'system' && (
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notification.content}</p>
                      <p className="text-sm text-gray-500">{notification.time}</p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500">Belum ada notifikasi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}