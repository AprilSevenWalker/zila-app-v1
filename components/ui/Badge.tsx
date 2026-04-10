import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "teal" | "muted";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = "default",
  className = "" 
}) => {
  const variantClasses = {
    default: "bg-color-muted text-color-dark",
    gold: "bg-color-gold text-color-dark",
    teal: "bg-color-teal text-color-surface",
    muted: "bg-color-muted text-color-surface"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
