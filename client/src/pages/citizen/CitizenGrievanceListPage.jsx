import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyGrievancesRequest } from "../../api/grievanceApi";
import { getStatusLabel } from "../../utils/grievanceMeta";

const CitizenGrievanceListPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [grievances, setGrievances] = useState([]);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        setIsLoading(true);
        const response = await getMyGrievancesRequest();
        setGrievances(response?.data || []);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load grievances");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGrievances();
  }, []);

  if (isLoading) {
    return <p className="text-slate-600">Loading grievances...</p>;
  }

  if (grievances.length === 0) {
    return (
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800">My Grievances</h2>
        <p className="mt-2 text-slate-600">You have not filed any grievances yet.</p>
        <Link
          to="/citizen/file"
          className="mt-4 inline-block rounded bg-primary px-4 py-2 text-white"
        >
          File Your First Grievance
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">My Grievances</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-3 py-2 text-left">Grievance ID</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {grievances.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="px-3 py-2">{item.grievanceId}</td>
                <td className="px-3 py-2">{item.title}</td>
                <td className="px-3 py-2">{getStatusLabel(item.status)}</td>
                <td className="px-3 py-2">{new Date(item.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <Link className="text-primary" to={`/citizen/grievances/${item._id}`}>
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CitizenGrievanceListPage;
