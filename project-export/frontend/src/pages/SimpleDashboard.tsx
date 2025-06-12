import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Home, Building2, FileText, Users, Settings, 
  PlusCircle, BarChart3, Shield, Database
} from "lucide-react";

export default function SimpleDashboard() {
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: "Properties",
      description: "Manage property listings",
      icon: <Building2 className="h-8 w-8" />,
      link: "/dashboard/properties",
      color: "bg-blue-500"
    },
    {
      title: "Announcements",
      description: "Create and manage announcements",
      icon: <FileText className="h-8 w-8" />,
      link: "/dashboard/announcements",
      color: "bg-green-500"
    },
    {
      title: "Site Settings",
      description: "Configure website settings",
      icon: <Settings className="h-8 w-8" />,
      link: "/dashboard/settings",
      color: "bg-purple-500"
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: <Users className="h-8 w-8" />,
      link: "/dashboard/users",
      color: "bg-orange-500"
    },
    {
      title: "Analytics",
      description: "View website analytics",
      icon: <BarChart3 className="h-8 w-8" />,
      link: "/dashboard/analytics",
      color: "bg-indigo-500"
    },
    {
      title: "System Monitor",
      description: "Monitor system health",
      icon: <Shield className="h-8 w-8" />,
      link: "/dashboard/monitoring",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <Home className="h-5 w-5" />
                <span>Back to Website</span>
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.fullName || user?.username}
              </span>
              <Link 
                href="/api/logout" 
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to The Views Real Estate Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your real estate platform from this central control panel.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Link key={index} href={card.link}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className={`${card.color} text-white p-3 rounded-lg`}>
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Active Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Announcements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Inquiries</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity to display.</p>
            <p className="text-sm">Activity will appear here as you use the dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}