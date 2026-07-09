import * as React from "react"
import { cn } from "../../lib/utils"
import { Eye, EyeOff } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        <div className="relative group">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none group-focus-within:text-primary-500 transition-colors text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              "block w-full pr-5 py-2.5 bg-input-bg border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-sm text-foreground shadow-sm placeholder:text-muted-foreground",
              icon ? "pl-14" : "pl-5",
              isPassword && "pr-14",
              error && "border-red-500 focus:ring-red-500/10 focus:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2 ml-1 font-medium animate-in slide-in-from-top-1 fade-in-0 duration-300">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
