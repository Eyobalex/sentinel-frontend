import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Save, AlertTriangle, Clock } from "lucide-react";

interface SettingsData {
  alertEmail: string;
  cleanupSchedule: string;
  batchAuditSchedule: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    alertEmail: "",
    cleanupSchedule: "0 * * * *",
    batchAuditSchedule: "0 */3 * * *",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings");
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setMessage({ type: "error", text: "Failed to load settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (settings.alertEmail && !/\S+@\S+\.\S+/.test(settings.alertEmail)) {
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
      });
      setSaving(false);
      return;
    }

    try {
      await api.put("/settings", settings);
      setMessage({ type: "success", text: "Settings updated successfully." });
    } catch (error) {
      console.error("Failed to update settings:", error);
      setMessage({ type: "error", text: "Failed to update settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-slate-400">
          Manage global configuration for Sentinel.
        </p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Alert Recipient Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AlertTriangle className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  name="alertEmail"
                  value={settings.alertEmail}
                  onChange={handleChange}
                  className="block w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="alerts@example.com"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                High severity alerts will be sent to this email address.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Cleanup Schedule
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-slate-500" />
                </div>
                <select
                  name="cleanupSchedule"
                  value={settings.cleanupSchedule}
                  onChange={handleChange}
                  className="block w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="* * * * *">Every minute</option>
                  <option value="0 * * * *">Every hour</option>
                  <option value="0 */6 * * *">Every 6 hours</option>
                  <option value="0 */12 * * *">Every 12 hours</option>
                  <option value="0 0 * * *">Every day</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Frequency for cleaning up old unassigned Medium severity alerts.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Batch Audit Schedule
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-slate-500" />
                </div>
                <select
                  name="batchAuditSchedule"
                  value={settings.batchAuditSchedule}
                  onChange={handleChange}
                  className="block w-full pl-10 bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="* * * * *">Every minute</option>
                  <option value="0 * * * *">Every hour</option>
                  <option value="0 */3 * * *">Every 3 hours</option>
                  <option value="0 */6 * * *">Every 6 hours</option>
                  <option value="0 */12 * * *">Every 12 hours</option>
                  <option value="0 0 * * *">Every day</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Frequency for running AI analysis on recent logs.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
