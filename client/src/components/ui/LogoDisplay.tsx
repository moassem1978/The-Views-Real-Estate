import { useState, useEffect } from "react";

interface LogoDisplayProps {
  logoUrl: string | undefined;
  companyName: string;
  className?: string;
  fallbackClassName?: string;
  fallbackInitials?: string;
}

export default function LogoDisplay({
  logoUrl,
  companyName,
  className = "h-10 w-10",
  fallbackClassName = "h-10 w-10 rounded-full bg-[#B87333] flex items-center justify-center shadow-md",
  fallbackInitials = "TV"
}: LogoDisplayProps) {
  const [isError, setIsError] = useState(false);
  
  // Reset error state when logo URL changes
  useEffect(() => {
    setIsError(false);
  }, [logoUrl]);
  
  // Check if the logo is an Adobe Illustrator file
  const isAiFile = logoUrl?.toLowerCase().endsWith('.ai');
  
  // If no logo or error occurred, show fallback
  if (!logoUrl || isError || isAiFile) {
    // For AI files or error cases, show a branded fallback
    return (
      <div className={fallbackClassName}>
        <span className="font-serif font-bold text-white text-lg">{fallbackInitials}</span>
      </div>
    );
  }
  
  // Show the logo
  return (
    <div className={`overflow-hidden ${className}`}>
      <img 
        src={logoUrl} 
        alt={companyName}
        className="h-full w-full object-contain"
        onError={() => setIsError(true)}
      />
    </div>
  );
}