import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Bell,
  Users,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../services/api";

const Layout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const [isSystemOnline, setIsSystemOnline] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get("/health");
        setIsSystemOnline(true);
      } catch (error) {
        setIsSystemOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-emerald-500/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Shield className="w-8 h-8 text-emerald-500 mr-3" />
          <span className="text-xl font-bold tracking-wider text-white">
            SENTINEL
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/")
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/active-alerts"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/active-alerts")
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Active Alerts</span>
          </Link>
          <Link
            to="/alerts"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/alerts")
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Alert History</span>
          </Link>
          <Link
            to="/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/users")
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>User Management</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/settings")
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50 px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">
            {isActive("/") && "Dashboard"}
            {location.pathname === "/active-alerts" && "Active Alerts"}
            {location.pathname === "/settings" && "Settings"}
            {isActive("/alerts") && "Alert History"}
            {isActive("/users") && "User Management"}
            {isActive("/settings") && "Settings"}
          </h1>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isSystemOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <span
              className={`text-sm font-mono ${
                isSystemOnline ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isSystemOnline ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
            </span>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
