import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  icon,
  fullWidth = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 focus:outline-none active:scale-95 shadow-sm hover:shadow-md";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-[#00B08A] shadow-glow-primary",
    accent: "bg-accent text-white hover:bg-[#E56D48] shadow-glow-accent",
    white: "bg-white text-textMain border border-gray-100 hover:bg-gray-50",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary/10",
    ghost: "text-textLight hover:text-primary hover:bg-primary/5 shadow-none hover:shadow-none"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};