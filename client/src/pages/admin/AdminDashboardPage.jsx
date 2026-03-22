import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminAnalyticsRequest } from "../../api/adminApi";

const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getAdminAnalyticsRequest();
        setAnalytics(response?.data || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <p className="text-slate-600">Loading analytics...</p>;
  if (!analytics) return <p className="text-red-600">No analytics data available.</p>;

  const summary = analytics.summary || {};

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Admin Analytics Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total All Time</p>
          <p className="text-2xl font-bold text-slate-800">{summary.totalAllTime || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">This Month</p>
          <p className="text-2xl font-bold text-slate-800">{summary.totalThisMonth || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-slate-800">{summary.totalResolved || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="text-2xl font-bold text-slate-800">{summary.totalOverdue || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Avg Resolution (hrs)</p>
          <p className="text-2xl font-bold text-slate-800">{summary.averageResolutionHours || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-800">Category Breakdown</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563EB" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-slate-800">Grievance Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#F97316" name="Filed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Ward Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-3 py-2 text-left">Ward</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-left">Resolved</th>
                <th className="px-3 py-2 text-left">Overdue</th>
                <th className="px-3 py-2 text-left">Avg Hrs</th>
              </tr>
            </thead>
            <tbody>
              {(analytics.wardPerformance || []).map((ward) => (
                <tr key={ward.wardId} className="border-b">
                  <td className="px-3 py-2">{ward.wardName}</td>
                  <td className="px-3 py-2">{ward.total}</td>
                  <td className="px-3 py-2">{ward.resolved}</td>
                  <td className="px-3 py-2">{ward.overdue}</td>
                  <td className="px-3 py-2">{ward.averageResolutionHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
