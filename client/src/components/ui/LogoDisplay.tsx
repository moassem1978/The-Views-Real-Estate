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
  const [formattedUrl, setFormattedUrl] = useState<string | undefined>(undefined);
  
  // Format URL and reset error state when logo URL changes
  useEffect(() => {
    setIsError(false);
    
    if (!logoUrl) {
      setFormattedUrl(undefined);
      return;
    }
    
    // Format the URL properly
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      // External URLs remain unchanged
      setFormattedUrl(logoUrl);
    } else if (logoUrl.startsWith('/uploads/')) {
      // Uploads directory paths are kept as is
      setFormattedUrl(logoUrl);
    } else if (logoUrl.startsWith('/')) {
      // Other paths starting with / are kept as is
      setFormattedUrl(logoUrl);
    } else {
      // For any other format, add a forward slash
      setFormattedUrl('/' + logoUrl);
    }
    
    console.log(`Logo URL: Original=${logoUrl}, Formatted=${formattedUrl}`);
  }, [logoUrl]);
  
  // Check if the logo is an Adobe Illustrator file
  const isAiFile = logoUrl?.toLowerCase().endsWith('.ai');
  
  // If no logo or error occurred, show fallback
  if (!formattedUrl || isError || isAiFile) {
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