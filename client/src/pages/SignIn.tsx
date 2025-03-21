import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simulate authentication
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just show an error message since we don't have actual authentication
      setError("This is a demo application. Authentication is not implemented.");
    } catch (err) {
      setError("An error occurred during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-[#F9F6F2] py-12">
        <div className="w-full max-w-md mx-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-[#333333] px-6 py-8 text-center relative">
              <div className="absolute inset-0 opacity-20">
                <img 
                  src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                  alt="Luxury property" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#333333]/70 to-[#333333]/90"></div>
              <div className="relative z-10">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5E5A3] to-[#D4AF37] mx-auto flex items-center justify-center shadow-md mb-4">
                  <span className="font-serif font-bold text-white text-2xl">LR</span>
                </div>
                <h1 className="text-2xl font-serif text-white font-semibold">Welcome Back</h1>
                <p className="text-white/80 mt-2">Sign in to access your account</p>
              </div>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="bg-[#983B45]/10 text-[#983B45] p-4 rounded-md mb-6">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p>{error}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors" 
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input 
                      id="remember-me"
                      type="checkbox" 
                      className="h-4 w-4 border-[#E8DACB] rounded text-[#D4AF37] focus:ring-[#D4AF37]" 
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  <a href="#" className="text-sm text-[#D4AF37] hover:text-[#BF9B30]">
                    Forgot password?
                  </a>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full p-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-[#D4AF37] hover:text-[#BF9B30] font-medium">
                    Create account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}