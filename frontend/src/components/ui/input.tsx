import * as React from "react"
import { cn } from "../../lib/utils"
import { Eye, EyeOff } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  allowNegative?: boolean;
  disableArrowKeys?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, allowNegative = false, disableArrowKeys = true, onWheel, onKeyDown, onChange, min, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const isNumber = type === "number";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (isNumber) {
        e.currentTarget.blur();
      }
      if (onWheel) onWheel(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isNumber) {
        if (disableArrowKeys && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();
        }
        if (!allowNegative && (e.key === '-' || e.key === 'e' || e.key === 'E')) {
          e.preventDefault();
        }
      }
      if (onKeyDown) onKeyDown(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumber && !allowNegative && e.target.value !== '') {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val < 0) {
          e.target.value = Math.abs(val).toString();
        }
      }
      if (onChange) onChange(e);
    };

    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 [&>svg]:w-4 [&>svg]:h-4">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            min={isNumber && !allowNegative ? (min ?? 0) : min}
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            className={cn(
              "block w-full h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors",
              isNumber && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]",
              icon ? "pl-9" : "pl-3",
              isPassword ? "pr-9" : "pr-3",
              error && "border-red-400 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
