import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AuthTest() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setApiResponse(null);

    try {
      console.log(`Attempting to log in with username: ${username}`);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setApiResponse(data);

      if (response.ok) {
        toast({
          title: "Login successful",
          description: `Welcome, ${data.username}!`,
        });
        setLoggedInUser(data);
      } else {
        toast({
          title: "Login failed",
          description: data.message || "An error occurred during login.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      setApiResponse(data);

      if (response.ok) {
        setLoggedInUser(null);
        toast({
          title: "Logout successful",
          description: "You have been logged out.",
        });
      } else {
        toast({
          title: "Logout failed",
          description: data.message || "An error occurred during logout.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const checkSession = async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include',
      });

      const data = await response.json();
      setApiResponse(data);

      if (response.ok) {
        setLoggedInUser(data);
        toast({
          title: "Session active",
          description: `Logged in as ${data.username}`,
        });
      } else {
        setLoggedInUser(null);
        toast({
          title: "No active session",
          description: data.message || "You are not logged in.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Session check error:', error);
      toast({
        title: "Session check error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Test the login/logout functionality</CardDescription>
        </CardHeader>
        <CardContent>
          {loggedInUser ? (
            <div className="space-y-4">
              <div className="p-4 border rounded bg-green-50">
                <h3 className="font-medium">Logged in as:</h3>
                <p><strong>Username:</strong> {loggedInUser.username}</p>
                <p><strong>Role:</strong> {loggedInUser.role}</p>
                <p><strong>ID:</strong> {loggedInUser.id}</p>
              </div>
              <Button onClick={handleLogout} className="w-full">Logout</Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
          <Button variant="secondary" onClick={checkSession}>
            Check Session
          </Button>
        </CardFooter>
      </Card>

      {apiResponse && (
        <Card className="w-full max-w-md mt-6">
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-gray-100 rounded overflow-auto text-xs">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}