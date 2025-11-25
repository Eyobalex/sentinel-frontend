import { useState, useEffect } from "react";
import {
  Activity,
  Shield,
  Terminal,
  Search,
  AlertTriangle,
} from "lucide-react";
import api from "../services/api";

interface Alert {
  _id: string;
  timestamp: string;
  aiAnalysis: {
    severity: "High" | "Medium" | "Low";
    summary: string;
  };
  message?: string;
}

interface Stats {
  High: number;
  Medium: number;
  Low: number;
  [key: string]: number;
}

const Dashboard = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [stats, setStats] = useState<Stats>({ High: 0, Medium: 0, Low: 0 });

  const fetchLatestAlerts = async () => {
    try {
      const res = await api.get("/alerts/latest");
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/alerts/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchLatestAlerts();
    fetchStats();
    const interval = setInterval(() => {
      fetchLatestAlerts();
      fetchStats();
    }, 180000); // 3 minutes
    return () => clearInterval(interval);
  }, []);

  const runLiveScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 100);

    try {
      const response = await api.post("/alerts/audit");
      const data = response.data.data;

      clearInterval(interval);
      setScanProgress(100);

      setTimeout(() => {
        setAlerts((prev) => [data, ...prev].slice(0, 10)); // Keep top 10
        setIsScanning(false);
        fetchStats(); // Update stats after scan
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setScanProgress(100);
      console.error("Scan failed:", error);
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          icon={<AlertTriangle />}
          label="High Severity Threats"
          value={stats.High}
          color="text-red-400"
        />
        <StatusCard
          icon={<AlertTriangle />}
          label="Medium Severity Threats"
          value={stats.Medium}
          color="text-amber-400"
        />
        <StatusCard
          icon={<Activity />}
          label="Low Severity Threats"
          value={stats.Low}
          color="text-blue-400"
        />
      </div>

      {/* Main Action Area */}
      <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent pointer-events-none"></div>

        <div className="z-10 text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">System Scan</h2>
          <p className="text-gray-400">
            Run a comprehensive security audit of your network.
          </p>
        </div>

        <button
          onClick={runLiveScan}
          disabled={isScanning}
          className={`
            group relative px-8 py-4 rounded-full font-bold text-lg tracking-wide transition-all duration-300
            ${
              isScanning
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]"
            }
          `}
        >
          <span className="flex items-center space-x-3">
            {isScanning ? (
              <>
                <Activity className="w-6 h-6 animate-spin" />
                <span>SCANNING... {scanProgress}%</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                <span>RUN LIVE SCAN</span>
              </>
            )}
          </span>
        </button>

        {isScanning && (
          <div className="w-full max-w-md h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-100 ease-out"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span>Live Alert Feed</span>
        </h3>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No alerts detected.
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className="p-4 flex items-start space-x-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="mt-1">
                    {alert.aiAnalysis?.severity === "High" && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    {alert.aiAnalysis?.severity === "Medium" && (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                    {alert.aiAnalysis?.severity === "Low" && (
                      <Activity className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        alert.aiAnalysis?.severity === "High"
                          ? "text-red-400"
                          : alert.aiAnalysis?.severity === "Medium"
                          ? "text-amber-400"
                          : "text-blue-400"
                      }`}
                    >
                      {alert.aiAnalysis?.summary || alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function StatusCard({ icon, label, value, color }: StatusCardProps) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 flex items-center space-x-4">
      <div className={`p-3 rounded-lg bg-gray-700/50 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;
