import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/utils";

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
  const [formattedUrl, setFormattedUrl] = useState<string | undefined>(undefined);
  
  // Check if the logo is an unsupported file format
  const isUnsupportedFormat = (url?: string): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    const unsupportedExtensions = ['.ai', '.eps', '.psd', '.indd'];
    return unsupportedExtensions.some(ext => lowerUrl.endsWith(ext));
  };
  
  // Format URL and reset error state when logo URL changes
  useEffect(() => {
    setIsError(false);
    
    // Handle unsupported formats immediately
    if (logoUrl && isUnsupportedFormat(logoUrl)) {
      setIsError(true);
      return;
    }
    
    if (!logoUrl) {
      setFormattedUrl(undefined);
      return;
    }
    
    // Handle both absolute and relative URLs
    const url = logoUrl.startsWith('http') ? logoUrl : logoUrl;
    setFormattedUrl(url);
    
  }, [logoUrl]);
  
  // Create initials from company name
  const getInitials = (): string => {
    if (!companyName) return fallbackInitials;
    
    const words = companyName.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };
  
  // When we detect an error or unsupported format, show initials
  if (isError || isUnsupportedFormat(logoUrl)) {
    return (
      <div className={fallbackClassName}>
        <span className="font-serif font-bold text-white text-lg">{getInitials()}</span>
      </div>
    );
  }
  
  // When we have no URL, show initials
  if (!formattedUrl) {
    return (
      <div className={fallbackClassName}>
        <span className="font-serif font-bold text-white text-lg">{getInitials()}</span>
      </div>
    );
  }
  
  // Show the logo
  return (
    <div className={`overflow-hidden ${className}`}>
      <img 
        src={formattedUrl} 
        alt={companyName}
        className="h-full w-full object-contain"
        onError={() => {
          console.log('Logo failed to load:', formattedUrl);
          setIsError(true);
        }}
      />
    </div>
  );
}