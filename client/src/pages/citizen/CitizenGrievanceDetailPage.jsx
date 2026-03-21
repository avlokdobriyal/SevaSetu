import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getGrievanceByIdRequest } from "../../api/grievanceApi";
import { getStatusLabel } from "../../utils/grievanceMeta";

const statusSequence = [
  "submitted",
  "assigned_to_officer",
  "worker_assigned",
  "in_progress",
  "resolved",
  "closed",
  "appealed",
];

const CitizenGrievanceDetailPage = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [grievance, setGrievance] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getGrievanceByIdRequest(id);
        setGrievance(response?.data || null);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load grievance detail");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const timelineMap = useMemo(() => {
    const map = {};
    (grievance?.statusHistory || []).forEach((entry) => {
      if (!map[entry.status]) {
        map[entry.status] = entry;
      }
    });
    return map;
  }, [grievance]);

  if (isLoading) {
    return <p className="text-slate-600">Loading grievance detail...</p>;
  }

  if (!grievance) {
    return <p className="text-red-600">Grievance not found.</p>;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800">{grievance.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{grievance.grievanceId}</p>
        <p className="mt-3 text-slate-700">{grievance.description}</p>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <div>
            <span className="font-medium text-slate-700">Current Status: </span>
            <span>{getStatusLabel(grievance.status)}</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Category: </span>
            <span>{grievance.category}</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Ward: </span>
            <span>{grievance?.ward?.name || "N/A"}</span>
          </div>
        </div>

        {grievance.imageUrls?.length > 0 ? (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium text-slate-700">Uploaded Images</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {grievance.imageUrls.map((url) => (
                <img
                  key={url}
                  src={`http://localhost:5000${url}`}
                  alt="Grievance evidence"
                  className="h-36 w-full rounded border object-cover"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-800">Status Timeline</h3>
        <p className="mt-1 text-sm text-slate-600">
          Track each stage of your grievance like an order tracker.
        </p>

        <div className="mt-6 space-y-4">
          {statusSequence.map((status) => {
            const entry = timelineMap[status];
            const isCompleted = Boolean(entry);

            return (
              <div key={status} className="flex gap-3">
                <div className="mt-0.5">
                  <div
                    className={`h-4 w-4 rounded-full ${
                      isCompleted ? "bg-primary" : "bg-slate-300"
                    }`}
                  />
                </div>
                <div className="flex-1 rounded border border-slate-200 p-3">
                  <p className="font-medium text-slate-800">{getStatusLabel(status)}</p>
                  {entry ? (
                    <>
                      <p className="mt-1 text-xs text-slate-600">
                        {new Date(entry.timestamp).toLocaleString()} by {entry.updatedBy?.name || "System"}
                      </p>
                      {entry.note ? <p className="mt-1 text-sm text-slate-700">{entry.note}</p> : null}
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">Pending</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CitizenGrievanceDetailPage;
