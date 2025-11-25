import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../services/api";

interface Alert {
  _id: string;
  timestamp: string;
  aiAnalysis: {
    severity: "High" | "Medium" | "Low";
    summary: string;
  };
  rawLog: {
    ip: string;
  };
  assigned: "not_assigned" | "tier_2" | "tier_3" | "no_need";
}

interface Filters {
  severity: string;
  startDate: string;
  endDate: string;
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    severity: "",
    startDate: "",
    endDate: "",
  });
  const [tempFilters, setTempFilters] = useState<Filters>({
    severity: "",
    startDate: "",
    endDate: "",
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...filters,
      });
      const res = await api.get(`/alerts/history?${queryParams}`);
      setAlerts(res.data.alerts);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch alert history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTempFilters({ ...tempFilters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  const resetFilters = () => {
    setTempFilters({ severity: "", startDate: "", endDate: "" });
    setFilters({ severity: "", startDate: "", endDate: "" });
    setPage(1);
  };

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Alert History</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
          <select
            name="severity"
            value={tempFilters.severity}
            onChange={handleFilterChange}
            className="bg-gray-900 text-gray-300 text-sm rounded-md border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 p-2"
          >
            <option value="">All Severities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <input
            type="date"
            name="startDate"
            value={tempFilters.startDate}
            onChange={handleFilterChange}
            className="bg-gray-900 text-gray-300 text-sm rounded-md border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 p-2"
          />

          <span className="text-gray-500">-</span>

          <input
            type="date"
            name="endDate"
            value={tempFilters.endDate}
            onChange={handleFilterChange}
            className="bg-gray-900 text-gray-300 text-sm rounded-md border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 p-2"
          />

          <button
            onClick={applyFilters}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Filter
          </button>

          <button
            onClick={resetFilters}
            className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Summary</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Assigned</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No alerts found.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr
                    key={alert._id}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.aiAnalysis?.severity === "High"
                            ? "bg-red-500/10 text-red-400"
                            : alert.aiAnalysis?.severity === "Medium"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {alert.aiAnalysis?.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {alert.aiAnalysis?.summary}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                      {alert.rawLog?.ip}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          alert.assigned === "not_assigned"
                            ? "bg-gray-500/10 text-gray-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {alert.assigned.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
