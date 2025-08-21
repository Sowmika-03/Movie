import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`bg-dark-800 border-dark-600 text-white placeholder-dark-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-royaltix-500 focus:border-transparent transition-all duration-300 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
