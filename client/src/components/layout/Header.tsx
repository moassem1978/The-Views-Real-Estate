import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm z-50 relative">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <img src="/logo.png" alt="The Views Logo" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-serif font-bold text-[#B87333] leading-none">The Views</h1>
            <p className="text-xs text-gray-700 tracking-wide">REAL ESTATE</p>
          </div>
        </Link>

        {/* Hamburger Toggle */}
        <button
          className="md:hidden text-[#B87333]"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Nav (optional) */}
        <nav className="hidden md:flex space-x-6 text-sm text-gray-700 font-medium">
          <Link href="/properties">Browse Properties</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white px-4 py-4 border-t border-gray-200">
          <nav className="flex flex-col space-y-4 text-gray-800">
            <Link href="/properties" onClick={() => setMobileMenuOpen(false)}>
              Browse Properties
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}