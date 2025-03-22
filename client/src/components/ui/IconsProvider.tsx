import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

// Define the type for the Lucide icons more specifically
type LucideIconsType = typeof LucideIcons;

// Create a context to provide the loaded icons
type IconsContextType = {
  icons: LucideIconsType | null;
  loading: boolean;
};

const IconsContext = createContext<IconsContextType>({
  icons: null,
  loading: true,
});

// Hook to access the icon context
export const useIcons = () => useContext(IconsContext);

// Provider component that loads icons on demand
export function IconsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IconsContextType>({
    icons: null,
    loading: true,
  });

  useEffect(() => {
    // Load icons only when needed
    setState({
      icons: LucideIcons,
      loading: false,
    });
    
    // Clean up function
    return () => {
      setState({
        icons: null,
        loading: true,
      });
    };
  }, []);

  return (
    <IconsContext.Provider value={state}>
      {children}
    </IconsContext.Provider>
  );
}

// Optimized Icon component using the context
export function OptimizedIcon({ 
  name, 
  size = 24, 
  ...props 
}: { 
  name: keyof typeof LucideIcons; 
  size?: number; 
  [key: string]: any 
}) {
  const { icons, loading } = useIcons();
  
  if (loading || !icons) {
    // Simple SVG skeleton during loading
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      </svg>
    );
  }
  
  const IconComponent = icons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent size={size} {...props} />;
}