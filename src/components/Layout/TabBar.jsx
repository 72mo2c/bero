// ======================================
// TabBar - شريط التبويبات الحقيقي
// ======================================

import React from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { useTab } from '../../contexts/TabContext';

const TabBar = () => {
  const { tabs, activeTabId, closeTab, switchTab, openNewTab } = useTab();

  return (
    <div className="h-9 flex items-center gap-2 px-3 overflow-x-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
      {/* التبويبات */}
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          
          return (
            <div
              key={tab.id}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-t-lg transition-all cursor-pointer group relative
                min-w-[140px] max-w-[220px] flex-shrink-0
                ${
                  isActive
                    ? 'bg-white shadow-lg border-t-2 border-l border-r border-orange-500 -mb-[1px] z-10'
                    : 'bg-white/60 hover:bg-white/90 border border-transparent hover:border-orange-300/50 shadow-sm'
                }
              `}
              onClick={() => switchTab(tab.id)}
            >
              {/* أيقونة التبويب */}
              <span className={`text-base flex-shrink-0 transition-transform ${
                isActive ? 'scale-110' : 'group-hover:scale-105'
              }`}>{tab.icon}</span>
              
              {/* عنوان التبويب */}
              <span 
                className={`
                  text-sm font-semibold truncate flex-1
                  ${isActive ? 'text-orange-600' : 'text-gray-600 group-hover:text-gray-800'}
                `}
                title={tab.title}
              >
                {tab.title}
              </span>

              {/* زر الإغلاق (فقط للتبويبات الإضافية) */}
              {!tab.isMain && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={`
                    flex-shrink-0 p-1 rounded-md transition-all
                    ${
                      isActive
                        ? 'text-orange-500 hover:bg-orange-100 hover:text-orange-700'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                    }
                  `}
                  title="إغلاق التبويب"
                >
                  <FaTimes size={11} />
                </button>
              )}

              {/* مؤشر التبويب النشط */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 rounded-t-full" />
              )}
            </div>
          );
        })}
      </div>
        {/* زر الحساب */}
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
          {/* زر تبويب جديد */}
      <button
        onClick={openNewTab}
        className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white bg-orange-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-600 rounded-lg transition-all shadow-sm hover:shadow-md flex-shrink-0 ml-1"
        title="تبويب جديد (Ctrl+T)"
      >
        <FaPlus size={13} className="font-bold" />
      </button>
        </div>
    </div>
  );
};

export default TabBar;