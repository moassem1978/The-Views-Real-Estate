import { Link } from "wouter";
import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-3 px-4 md:px-8 flex justify-between items-center">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="The Views Logo" 
            className="h-10 w-auto object-contain" 
          />
          <div className="text-left">
            <h1 className="text-xl font-serif font-bold text-[#B87333] leading-none">The Views</h1>
            <p className="text-xs text-gray-700 tracking-wide">REAL ESTATE</p>
          </div>
        </div>
      </Link>

      {/* Mobile Nav Icon */}
      <button className="md:hidden text-[#B87333]" aria-label="Menu">
        <Menu size={28} />
      </button>
    </header>
  );
}