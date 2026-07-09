import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "gradient" | "brand" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "brand", size = "default", isLoading, loadingText, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed group gap-3",
          {
            "bg-primary-600 text-brand-on-accent hover:bg-primary-700": variant === "default",
            "bg-gradient-to-r from-primary-600 to-primary-400 text-brand-on-accent hover:brightness-110 shadow-lg shadow-primary-600/20 border border-primary-500/50": variant === "gradient",
            "border border-border bg-input-bg hover:bg-muted text-foreground": variant === "outline",
            "hover:bg-muted text-foreground": variant === "ghost",
            "bg-rose-500 hover:bg-rose-600 text-white shadow-md": variant === "destructive",
            "bg-brand-accent hover:bg-brand-accent-hover text-brand-on-accent shadow-xl shadow-primary-600/25 hover:shadow-primary-600/35 hover:-translate-y-1": variant === "brand",
          },
          {
            "h-14 px-6 py-5 text-base": size === "default",
            "h-9 px-3 rounded-lg text-xs": size === "sm",
            "h-16 px-8 rounded-2xl text-lg": size === "lg",
            "h-10 w-10 rounded-xl p-0": size === "icon",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-3">
            {loadingText ? <span>{loadingText}</span> : null}
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-white/90 rounded-full animate-bounce"></div>
            </div>
          </div>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
