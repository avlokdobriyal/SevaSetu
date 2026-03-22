import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import { getMyGrievancesRequest } from "../../api/grievanceApi";
import { getStatusLabel } from "../../utils/grievanceMeta";
import getErrorMessage from "../../utils/getErrorMessage";

const WorkerGrievancesPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getMyGrievancesRequest();
        setGrievances(response?.data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load grievances"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <LoadingState message="Loading assigned grievances..." />;

  if (grievances.length === 0) {
    return (
      <EmptyState
        title="No assigned grievances"
        description="Once an officer assigns a grievance to you, it will appear here."
      />
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">Assigned Grievances</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {grievances.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="px-3 py-2">{item.grievanceId}</td>
                <td className="px-3 py-2">{item.title}</td>
                <td className="px-3 py-2">{getStatusLabel(item.status)}</td>
                <td className="px-3 py-2">
                  <Link className="text-primary" to={`/worker/grievances/${item._id}`}>
                    Update
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

export default WorkerGrievancesPage;
