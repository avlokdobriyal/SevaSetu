import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getOfficerStatsRequest } from "../../api/grievanceApi";
import { createWorkerRequest } from "../../api/userApi";

const OfficerDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [workerForm, setWorkerForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getOfficerStatsRequest();
        setStats(response?.data || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load ward stats");
      }
    };

    load();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setWorkerForm((prev) => ({ ...prev, [name]: value }));
  };

  const createWorker = async (event) => {
    event.preventDefault();

    try {
      await createWorkerRequest(workerForm);
      toast.success("Worker account created");
      setWorkerForm({ name: "", email: "", password: "", phone: "", address: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create worker");
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800">Ward Officer Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Grievances</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.total || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.resolved || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.overdue || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Avg Resolution (hrs)</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.averageResolutionHours || 0}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">Worker Management</h3>
        <form onSubmit={createWorker} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input name="name" value={workerForm.name} onChange={onChange} placeholder="Worker name" className="rounded border border-slate-300 px-3 py-2" />
          <input name="email" value={workerForm.email} onChange={onChange} placeholder="Worker email" className="rounded border border-slate-300 px-3 py-2" />
          <input name="password" value={workerForm.password} onChange={onChange} placeholder="Password" className="rounded border border-slate-300 px-3 py-2" />
          <input name="phone" value={workerForm.phone} onChange={onChange} placeholder="Phone" className="rounded border border-slate-300 px-3 py-2" />
          <input name="address" value={workerForm.address} onChange={onChange} placeholder="Address" className="rounded border border-slate-300 px-3 py-2" />
          <button className="rounded bg-primary px-4 py-2 text-white">Create Worker</button>
        </form>

        <Link to="/officer/grievances" className="mt-4 inline-block text-primary">
          Go to Ward Grievances
        </Link>
      </div>
    </section>
  );
};

export default OfficerDashboardPage;
