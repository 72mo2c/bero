// ======================================
// Compact Header - شريط علوي مصغر ومميز
// ======================================

import React, { useState } from 'react';
import { FaBell, FaUser, FaSignOutAlt, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from '../Common/GlobalSearch';
import TabBar from './TabBar';

const Header = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-[84px] fixed top-0 left-0 right-0 z-50 bg-white shadow-md transition-all">
        <div className="h-12 px-3 pr-16 flex items-center justify-between gap-3 bg-gradient-to-l from-orange-50 via-white to-white border-b border-orange-200/30">
        
        {/* Logo - صغير جداً */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <h1 className="text-sm font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent hidden md:block">
            Bero System
          </h1>
        </div>

        {/* Search Bar - مصغر */}
        <div className="hidden lg:flex flex-1 max-w-md">
          <GlobalSearch />
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="lg:hidden p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
        >
          <FaSearch size={14} />
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          
          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
            title="الإشعارات"
          >
            <FaBell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 p-1.5 pr-2 hover:bg-orange-50 rounded-lg transition-all"
              title={user?.name}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <FaUser size={11} />
              </div>
              <span className="hidden md:block text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                {user?.name?.split(' ')[0] || 'المستخدم'}
              </span>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-orange-100 py-1 z-50">
                  <div className="px-3 py-2 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/settings/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-right px-3 py-2 text-xs text-gray-700 hover:bg-orange-50 flex items-center gap-2 transition-all"
                  >
                    <FaUser className="text-orange-500" size={12} />
                    <span>الملف الشخصي</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all"
                  >
                    <FaSignOutAlt size={12} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        </div>

        {/* Tab Bar - شريط التبويبات */}
        <div className="border-t border-orange-200/50 bg-gradient-to-b from-orange-50/50 to-white">
          <TabBar />
        </div>
      </header>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="lg:hidden absolute top-full left-0 right-0 p-3 bg-white border-b border-orange-100 shadow-lg z-50">
          <GlobalSearch isMobile onClose={() => setShowMobileSearch(false)} />
        </div>
      )}
    </>
  );
};

export default Header;
