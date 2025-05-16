import { useState } from "react";
import goldLogoImport from '../../assets/views-logo-gold.png';

interface GoldLogoProps {
  className?: string;
  height?: string;
  width?: string;
}

export default function GoldLogo({ className = "", height = "40px", width = "auto" }: GoldLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  // If image fails to load, show a fallback
  if (imageError) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height, width }}>
        <span className="font-serif font-bold text-[#B87333] text-xl">The Views</span>
      </div>
    );
  }
  
  return (
    <div className={`overflow-hidden ${className}`} style={{ height, width }}>
      <img 
        src={goldLogoImport} 
        alt="The Views Real Estate"
        className="h-full w-auto object-contain"
        style={{ maxHeight: "100%" }}
        onError={() => setImageError(true)}
      />
    </div>
  );
}