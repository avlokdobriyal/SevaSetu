import { Link } from "react-router-dom";

const WorkerDashboardPage = () => {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">Worker Dashboard</h2>
      <p className="mt-2 text-slate-600">
        View your assigned grievances, update progress, and submit resolution notes.
      </p>

      <Link to="/worker/grievances" className="mt-4 inline-block rounded bg-primary px-4 py-2 text-white">
        View Assigned Grievances
      </Link>
    </section>
  );
};

export default WorkerDashboardPage;
