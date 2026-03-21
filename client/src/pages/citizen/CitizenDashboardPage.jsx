import { Link } from "react-router-dom";

const CitizenDashboardPage = () => {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">Citizen Dashboard</h2>
      <p className="mt-2 text-slate-600">File new complaints and track progress from one place.</p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/citizen/file" className="rounded bg-primary px-4 py-2 text-white">
          File New Grievance
        </Link>
        <Link to="/citizen/grievances" className="rounded border border-slate-300 px-4 py-2">
          View My Grievances
        </Link>
      </div>
    </section>
  );
};

export default CitizenDashboardPage;
