'use client'

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  label?: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { FilterDropdown };
