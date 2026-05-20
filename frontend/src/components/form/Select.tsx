import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options?: Option[];
  value?: string;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({
  options = [],
  value,
  placeholder = "Pilih opsi",
  className = "",
  onChange,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`h-11 w-50 appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;