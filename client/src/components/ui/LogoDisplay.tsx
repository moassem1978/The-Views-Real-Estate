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
  }, [logoUrl]);
  
  // Debug logging when formatted URL changes
  useEffect(() => {
    console.log(`Logo Display: Original URL=${logoUrl}, Formatted URL=${formattedUrl}`);
  }, [logoUrl, formattedUrl]);
  
  // Check if the logo is an Adobe Illustrator or other unsupported file
  const isUnsupportedFile = logoUrl?.toLowerCase().endsWith('.ai') || 
                          logoUrl?.toLowerCase().endsWith('.eps') ||
                          logoUrl?.includes('ai-placeholder');
  
  // If no logo or error occurred, show fallback with company name initials
  if (!formattedUrl || isError) {
    return (
      <div className={fallbackClassName}>
        <span className="font-serif font-bold text-white text-lg">{fallbackInitials}</span>
      </div>
    );
  }
  
  // For AI files, we'll try to display the image but have a fallback ready
  if (isUnsupportedFile) {
    try {
      // First attempt to display the image directly
      return (
        <div className={`overflow-hidden ${className}`}>
          <img 
            src={formattedUrl} 
            alt={companyName}
            className="h-full w-full object-contain"
            onError={() => {
              console.log('Logo (unsupported format) failed to load:', formattedUrl);
              setIsError(true);
            }}
          />
          <div className={`absolute inset-0 opacity-0 ${fallbackClassName}`} style={{zIndex: -1}}>
            <span className="font-serif font-bold text-white text-lg">{fallbackInitials}</span>
          </div>
        </div>
      );
    } catch (e) {
      // If there's any error, show the fallback
      console.log('Error displaying unsupported logo format:', e);
      return (
        <div className={fallbackClassName}>
          <span className="font-serif font-bold text-white text-lg">{fallbackInitials}</span>
        </div>
      );
    }
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