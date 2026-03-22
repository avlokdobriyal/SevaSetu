import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";
import LoadingState from "../../components/common/LoadingState";
import { getMyGrievancesRequest } from "../../api/grievanceApi";
import { getAllWardsRequest } from "../../api/wardApi";
import { CATEGORY_OPTIONS, getStatusLabel } from "../../utils/grievanceMeta";
import getErrorMessage from "../../utils/getErrorMessage";

const AdminGrievancesPage = () => {
  const [grievances, setGrievances] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", category: "", ward: "" });

  useEffect(() => {
    const loadWards = async () => {
      try {
        const response = await getAllWardsRequest();
        setWards(response?.data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load wards"));
      }
    };
    loadWards();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filters.status) params.set("status", filters.status);
        if (filters.category) params.set("category", filters.category);
        if (filters.ward) params.set("ward", filters.ward);

        const response = await getMyGrievancesRequest(`?${params.toString()}`);
        setGrievances(response?.data || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to load grievances"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <LoadingState message="Loading grievances with filters..." />;
  }

  if (grievances.length === 0) {
    return (
      <EmptyState
        title="No grievances matched your filters"
        description="Try clearing filters or selecting a different ward/category/status."
      />
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">All Grievances</h2>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <select name="status" value={filters.status} onChange={onChange} className="rounded border border-slate-300 px-3 py-2">
          <option value="">All Statuses</option>
          {[
            "submitted",
            "assigned_to_officer",
            "worker_assigned",
            "in_progress",
            "resolved",
            "closed",
            "overdue",
            "appealed",
          ].map((status) => (
            <option key={status} value={status}>{getStatusLabel(status)}</option>
          ))}
        </select>

        <select name="category" value={filters.category} onChange={onChange} className="rounded border border-slate-300 px-3 py-2">
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select name="ward" value={filters.ward} onChange={onChange} className="rounded border border-slate-300 px-3 py-2">
          <option value="">All Wards</option>
          {wards.map((ward) => (
            <option key={ward._id} value={ward._id}>{ward.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Ward</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {grievances.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="px-3 py-2">{item.grievanceId}</td>
                <td className="px-3 py-2">{item.title}</td>
                <td className="px-3 py-2">{item?.ward?.name || "-"}</td>
                <td className="px-3 py-2">{item.category}</td>
                <td className="px-3 py-2">{getStatusLabel(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminGrievancesPage;
