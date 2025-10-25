// ======================================
// Input Component - مكون حقل الإدخال
// ======================================

import React from 'react';
const Select = ({ options, ...props }) => {
  return (
    <select className="input-field" {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  className = '',
  icon = null,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="label flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 text-lg">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 group-focus-within:text-orange-600 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`input-field ${icon ? 'pr-12' : ''} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-orange-200'}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default Input;
