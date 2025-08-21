import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'royaltix' | 'crown' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'xl'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-royaltix-500 disabled:opacity-50"
    
    const variantClasses = {
      default: "bg-royaltix-600 hover:bg-royaltix-700 text-white",
      royaltix: "bg-royaltix-600 hover:bg-royaltix-700 text-white font-semibold py-3 px-6 rounded-xl transform hover:scale-105 hover:shadow-lg hover:shadow-royaltix-500/25",
      crown: "bg-crown-600 hover:bg-crown-700 text-white font-semibold py-3 px-6 rounded-xl transform hover:scale-105 hover:shadow-lg hover:shadow-crown-500/25",
      outline: "border border-dark-600 bg-dark-800 text-white hover:bg-dark-700",
      ghost: "text-gray-400 hover:text-white hover:bg-dark-800"
    }
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 py-1",
      lg: "h-11 px-8 py-2",
      xl: "h-14 px-8 py-4 text-lg"
    }
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
    
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
