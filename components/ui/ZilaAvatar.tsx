import React from "react";

interface ZilaAvatarProps {
  initials?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ZilaAvatar: React.FC<ZilaAvatarProps> = ({ 
  initials = "Z",
  size = "md",
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return (
    <div className={`flex items-center justify-center rounded-full bg-color-gold text-color-dark font-semibold ${sizeClasses[size]} ${className}`}>
      {initials}
    </div>
  );
};

export default ZilaAvatar;
