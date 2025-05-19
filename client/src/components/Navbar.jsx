import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { socket, notificationAPI, auth } from '../utils/api';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on component mount and route changes
  useEffect(() => {
    checkAuthStatus();
    if (auth.isAuthenticated()) {
      const user = auth.getCurrentUser();
      if (user) {
        const room = `user_${user.id}`;
        socket.emit('joinRoom', room);
        // Fetch initial notifications count
        notificationAPI.getNotifications().then(res => {
          const notifs = res.data.notifications || res.data; // adapt shape
          const unread = notifs.filter(n => !n.is_read).length;
          setNotifCount(unread);
        }).catch(()=>{});
        // Listen for new notifications
        socket.on('newNotification', (notif) => {
          setNotifCount(count => count + 1);
        });
      }
    }
  }, [location.pathname]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);
        setUserRole(parsedUser.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogout(); // Clear invalid data
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    }
  };

  const handleLogout = () => {
    auth.logout();
    setNotifCount(0);
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">JobNest</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Common navigation links */}
              <Link to="/" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </Link>

              {/* User-specific navigation */}
              {isAuthenticated && userRole === 'user' && (
                <>
                  <Link to="/user/search" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Find Jobs
                  </Link>
                  <Link to="/user/favorites" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Favorites
                  </Link>
                  <Link to="/user/lamaran" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    My Applications
                  </Link>
                </>
              )}

              {/* Company-specific navigation */}
              {isAuthenticated && userRole === 'company' && (
                <>
                  <Link to="/company/dashboard" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/company/lowongan" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    My Jobs
                  </Link>
                  <Link to="/company/post-job" className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Post Job
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Notification icon */}
            {isAuthenticated && (
              <Link to={userRole === 'company' ? "/company/notifikasi" : "/user/notifikasi"} className="p-2 rounded-full text-gray-400 hover:text-blue-500 relative">
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{notifCount}</span>}
              </Link>
            )}

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link to={userRole === 'company' ? "/company/profil" : "/user/profile"} className="text-gray-500 hover:text-blue-500">
                    {user?.email ? user.email.split('@')[0] : 'Profile'}
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="px-3 py-1 rounded-md text-sm font-medium border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-blue-500 hover:text-blue-700">
                    Login
                  </Link>
                  <Link to="/register" className="px-3 py-1 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-700">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              onClick={toggleMenu} 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            to="/" 
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
            onClick={toggleMenu}
          >
            Home
          </Link>
          
          {isAuthenticated && userRole === 'user' && (
            <>
              <Link 
                to="/user/search"
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500" 
                onClick={toggleMenu}
              >
                Find Jobs
              </Link>
              <Link 
                to="/user/favorites" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Favorites
              </Link>
              <Link 
                to="/user/lamaran" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                My Applications
              </Link>
              <Link 
                to="/user/profile" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Profile
              </Link>
              <Link 
                to="/user/notifikasi" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Notifications
              </Link>
            </>
          )}
          
          {isAuthenticated && userRole === 'company' && (
            <>
              <Link 
                to="/company/dashboard" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
              <Link 
                to="/company/lowongan" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                My Jobs
              </Link>
              <Link 
                to="/company/post-job" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Post Job
              </Link>
              <Link 
                to="/company/profil" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Company Profile
              </Link>
              <Link 
                to="/company/notifikasi" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Notifications
              </Link>
            </>
          )}
          
          {isAuthenticated ? (
            <button 
              onClick={() => {
                handleLogout();
                toggleMenu();
              }} 
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-gray-50 hover:border-red-500"
            >
              Logout
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-blue-500"
                onClick={toggleMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;