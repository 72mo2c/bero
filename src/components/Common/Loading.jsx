// ======================================
// Loading Component - مكون التحميل
// ======================================

import React from 'react';

/**
 * مكون التحميل العام للنظام
 * @param {Object} props
 * @param {string} props.message - رسالة التحميل
 * @param {boolean} props.fullScreen - عرض بملء الشاشة
 * @param {string} props.size - حجم التحميل (sm, md, lg)
 */
const Loading = ({ 
  message = "جاري التحميل...", 
  fullScreen = false,
  size = 'md'
}) => {
  // تحديد حجم الرسوم المتحركة
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center py-12';

  const content = (
    <div className={containerClasses}>
      <div className="text-center">
        {/* رسوم متحركة للتحميل */}
        <div className="relative">
          {/* الدائرة الخارجية */}
          <div className={`${sizeClasses[size]} mx-auto`}>
            <div className="absolute inset-0">
              <div className="h-full w-full rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 h-full w-full rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
          
          {/* الدائرة الداخلية */}
          <div className={`absolute inset-0 flex items-center justify-center ${sizeClasses[size]}`}>
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
          </div>
        </div>

        {/* رسالة التحميل */}
        {message && (
          <div className="mt-4">
            <p className="text-gray-600 font-medium animate-pulse">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return content;
};

/**
 * مكون التحميل السريع
 */
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`inline-block ${sizeClasses[size]} ${className}`}>
      <div className="relative h-full w-full">
        <div className="absolute inset-0">
          <div className="h-full w-full rounded-full border-2 border-gray-300"></div>
          <div className="absolute inset-0 h-full w-full rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * مكون التحميل مع النص
 */
export const LoadingWithText = ({ text, size = 'md' }) => {
  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <LoadingSpinner size={size} />
      {text && (
        <span className="text-gray-600 text-sm font-medium">
          {text}
        </span>
      )}
    </div>
  );
};

/**
 * مكون التحميل للإحصائيات
 */
export const LoadingStats = ({ rows = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-6 bg-gray-400 rounded w-32"></div>
            </div>
            <LoadingSpinner size="sm" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * مكون التحميل للجدول
 */
export const LoadingTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      {/* رأس الجدول */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-gray-300 rounded"></div>
        ))}
      </div>
      
      {/* صفوف البيانات */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4 mb-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Loading;
