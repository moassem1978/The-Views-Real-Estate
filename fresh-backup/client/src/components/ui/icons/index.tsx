// This file centralizes and optimizes all icon imports to reduce bundle size
import * as React from "react";

// Individual icon imports from lucide-react instead of the entire library
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Dot,
  GripVertical,
  Mic,
  MicOff,
  MoreHorizontal,
  PanelLeft,
  Search,
  X
} from "lucide-react";

// Type for all available icons
export type IconName = 
  | "alertCircle"
  | "arrowLeft"
  | "arrowRight"
  | "check"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "chevronUp"
  | "circle"
  | "dot"
  | "gripVertical"
  | "mic"
  | "micOff"
  | "moreHorizontal"
  | "panelLeft"
  | "search"
  | "x";

// Icon mapping to their components
export const IconMap = {
  alertCircle: AlertCircle,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  circle: Circle,
  dot: Dot,
  gripVertical: GripVertical,
  mic: Mic,
  micOff: MicOff,
  moreHorizontal: MoreHorizontal,
  panelLeft: PanelLeft,
  search: Search,
  x: X
};

// Props for the Icon component
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
}

// Icon component
export function Icon({ name, size = 24, className = "", ...props }: IconProps) {
  const IconComponent = IconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent size={size} className={className} {...props} />;
}

// Export all icons for direct imports
export {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Dot,
  GripVertical,
  Mic,
  MicOff,
  MoreHorizontal,
  PanelLeft,
  Search,
  X
};