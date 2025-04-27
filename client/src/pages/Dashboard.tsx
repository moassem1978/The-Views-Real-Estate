import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto max-w-screen-xl p-4 py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in to access the dashboard.</p>
            <div className="mt-4">
              <Link to="/auth">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl p-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome, {user.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The dashboard is currently under maintenance.
            <br />
            Please check back later for full management capabilities.
          </p>
          <div className="mt-4">
            <p className="font-semibold">Available Actions:</p>
            <ul className="list-disc list-inside mt-2">
              <li>View the site by going back to the home page</li>
              <li>Browse all property listings</li>
              <li>Contact the administrator for urgent changes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and manage all property listings.
            </p>
            <Link to="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              View and manage announcements.
            </p>
            <Button disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}