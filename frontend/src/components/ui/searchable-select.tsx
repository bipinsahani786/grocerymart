import { CustomDropdown } from './CustomDropdown';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  creatable?: boolean;
  onCreate?: (inputValue: string) => void | Promise<void>;
  onOpenChange?: (isOpen: boolean) => void;
}

export function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select option...",
  className,
  disabled = false,
  creatable = false,
  onCreate,
}: SearchableSelectProps) {
  return (
    <CustomDropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchable={true}
      className={className}
      disabled={disabled}
      creatable={creatable}
      onCreate={onCreate}
    />
  );
}
