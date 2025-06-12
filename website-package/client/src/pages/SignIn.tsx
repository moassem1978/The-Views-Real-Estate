import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";

export default function SignIn() {
  // Login states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [, setLocation] = useLocation();
  
  const { user, loginMutation } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    
    if (!username.trim() || !password) {
      setLocalError("Username and password are required");
      return;
    }
    
    // Clean username input
    const cleanUsername = username.trim().toLowerCase();
    
    loginMutation.mutate({ username: cleanUsername, password }, {
      onError: (error) => {
        console.error("Login error:", error);
        setLocalError(error.message || "Login failed. Please check your credentials.");
      },
      onSuccess: () => {
        console.log("Login successful, redirecting to dashboard");
        setLocation("/dashboard");
      }
    });
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
                  <span className="font-serif font-bold text-white text-2xl">TV</span>
                </div>
                <h1 className="text-2xl font-serif text-white font-semibold">Welcome Back</h1>
                <p className="text-white/80 mt-2">Sign in to access your account</p>
              </div>
            </div>
            
            <div className="p-6">
              {localError && (
                <div className="bg-[#983B45]/10 text-[#983B45] p-4 rounded-md mb-6">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p>{localError}</p>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h2 className="text-xl font-medium text-gray-800 text-center">Sign In</h2>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors" 
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.trim())}
                    autoComplete="username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:border-[#D4AF37] transition-colors" 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
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
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Alternative login method:</p>
                  <Link 
                    href="/otp-login" 
                    className="inline-block w-full p-3 bg-white border-2 border-[#D4AF37] text-[#D4AF37] font-medium rounded-md hover:bg-[#D4AF37] hover:text-white transition-all"
                  >
                    Login with One-Time Password (OTP)
                  </Link>
                </div>
              </div>
              
              <div className="text-center mt-6 text-sm text-gray-600">
                <p>For administrative assistance, please contact the system administrator.</p>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm mb-2">Development Mode</p>
                  <button 
                    onClick={() => setLocation("/dashboard")}
                    className="inline-block px-4 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Access Dashboard (Dev Bypass)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}