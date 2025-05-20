import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { notificationAPI, auth, socket } from "../utils/api";

export default function CompanyNotifikasi() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== 'company') {
      return;
    }
    const room = `user_${user.id}`;
    socket.emit('joinRoom', room);
    // fetch initial notifications
    notificationAPI.getNotifications().then(({ data }) => {
      setNotifications(data);
      setLoading(false);
    }).catch(() => setLoading(false));
    // subscribe to real-time events
    socket.on('newNotification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });
    return () => {
      socket.off('newNotification');
    };
  }, [user]);

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleMarkRead = async (id) => {
    await notificationAPI.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleDelete = async (id) => {
    await notificationAPI.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (loading) {
    return (
      <div className="font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Notifikasi</h1>
          <button onClick={handleMarkAllRead} className="text-sm text-blue-600 hover:text-blue-800">
            Tandai semua sudah dibaca
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {notifications.length > 0 ? (
            <ul className="divide-y divide-gray-200 text-left">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`p-4 ${!notif.is_read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 flex justify-between items-center`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* icon based on type */}
                    <div>
                      {notif.type === 'application' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                      {notif.type === 'message' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      )}
                      {notif.type === 'system' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{notif.message || notif.content}</p>
                      <p className="text-sm text-gray-500">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!notif.is_read && (
                      <button onClick={() => handleMarkRead(notif.id)} className="text-xs text-blue-600 hover:underline">Tandai dibaca</button>
                    )}
                    <button onClick={() => handleDelete(notif.id)} className="text-xs text-red-600 hover:underline">Hapus</button>
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