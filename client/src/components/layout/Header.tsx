import { Link } from "wouter";
import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="/logo.png" // Make sure logo.png exists in public/
              alt="The Views Logo"
              className="h-10 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <div className="text-lg font-serif">
              <span className="text-gray-900 font-semibold">The</span>{" "}
              <span className="text-[#B87333] font-bold">Views</span>
              <div className="text-sm text-gray-600 leading-tight">REAL ESTATE</div>
            </div>
          </div>
        </Link>

        {/* Menu Icon (Mobile) */}
        <button className="text-[#B87333] lg:hidden">
          <Menu className="w-6 h-6" />
        </button>

        {/* Nav Placeholder for Future Menu */}
        <nav className="hidden lg:flex space-x-6">
          {/* Add future nav links here */}
        </nav>
      </div>
    </header>
  );
}