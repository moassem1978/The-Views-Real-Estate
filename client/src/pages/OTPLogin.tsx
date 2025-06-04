import { useState } from "react";
import { Link, useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function OTPLogin() {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [username, setUsername] = useState("");
  const [otp, setOTP] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to request OTP");
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setStep('verify');
      
      toast({
        title: "OTP Sent",
        description: data.otp ? `Your OTP is: ${data.otp}` : "Please check your email for the OTP",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "OTP is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/verify-otp", {
        sessionId,
        otp: otp.trim()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid OTP");
      }

      const data = await response.json();
      
      // Update query cache with user data
      queryClient.setQueryData(["/api/user"], data.user);
      
      toast({
        title: "Success",
        description: "Login successful!",
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-[#F9F6F2] py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">TV</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-600">
                {step === 'request' 
                  ? 'Enter your username to receive an OTP' 
                  : 'Enter the OTP sent to you'
                }
              </p>
            </div>

            {step === 'request' ? (
              <form onSubmit={requestOTP} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full p-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOTP} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    className="w-full p-3 border border-[#E8DACB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent text-center text-lg tracking-widest"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Username: {username}
                  </p>
                </div>
                
                <button 
                  type="submit" 
                  className="w-full p-3 bg-[#D4AF37] hover:bg-[#BF9B30] text-white font-medium rounded-md transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => {
                    setStep('request');
                    setOTP('');
                    setSessionId('');
                  }}
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
                  disabled={loading}
                >
                  Back to Username
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Link href="/signin" className="text-[#D4AF37] hover:text-[#BF9B30] text-sm">
                  Use traditional login instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}