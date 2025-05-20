import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import { notificationAPI, socket, auth } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function UserNotifikasi() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/login/user'); return;
    }
    // Join user room
    const user = auth.getCurrentUser();
    socket.emit('joinRoom', `user_${user.id}`);
    // Fetch existing notifications
    notificationAPI.getNotifications()
      .then(res => {
        const data = res.data.notifications || res.data;
        setNotifications(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    // Listen for new notifications
    const handler = (notif) => {
      setNotifications(prev => [notif, ...prev]);
    };
    socket.on('newNotification', handler);
    return () => {
      socket.off('newNotification', handler);
    };
  }, [navigate]);

  const markAllRead = () => {
    notificationAPI.markAllRead().then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }).catch(err => console.error(err));
  };

  // Delete individual notification
  const handleDeleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return (
    <div className="font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Notifikasi</h1>
          <button onClick={markAllRead} className="text-sm text-blue-600 hover:text-blue-800">
            Tandai semua sudah dibaca
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : notifications.length > 0 ? (
            <ul className="divide-y divide-gray-200 text-left">
              {notifications.map(notification => (
                <li key={notification.id} className={`p-4 ${!notification.is_read ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50`}>  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {/* icon logic */}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{notification.message || notification.content}</p>
                        <p className="text-sm text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleDeleteNotification(notification.id)} className="ml-4 text-red-500 hover:text-red-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v1H2.5a.5.5 0 000 1H3v9a2 2 0 002 2h10a2 2 0 002-2V6h.5a.5.5 0 000-1H16V4a2 2 0 00-2-2H6zm2 3v9a1 1 0 102 0V5H8zm4 0v9a1 1 0 102 0V5h-2z" clipRule="evenodd" />
                      </svg>
                    </button>
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
