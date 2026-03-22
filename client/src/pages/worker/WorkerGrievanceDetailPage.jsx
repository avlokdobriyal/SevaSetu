import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingState from "../../components/common/LoadingState";
import {
  getGrievanceByIdRequest,
  markInProgressRequest,
  markResolvedRequest,
} from "../../api/grievanceApi";
import { getStatusLabel } from "../../utils/grievanceMeta";
import getErrorMessage from "../../utils/getErrorMessage";

const WorkerGrievanceDetailPage = () => {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      setIsLoading(true);
      const response = await getGrievanceByIdRequest(id);
      setGrievance(response?.data || null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load grievance"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const startWork = async () => {
    try {
      const response = await markInProgressRequest(id, { note: "Worker started field work" });
      setGrievance(response?.data || grievance);
      toast.success("Marked as in progress");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status"));
    }
  };

  const resolveWork = async () => {
    if (!resolutionNote.trim()) {
      toast.error("Resolution note is required");
      return;
    }

    try {
      const response = await markResolvedRequest(id, { resolutionNote: resolutionNote.trim() });
      setGrievance(response?.data || grievance);
      toast.success("Marked as resolved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to resolve grievance"));
    }
  };

  if (isLoading) return <LoadingState message="Loading grievance detail..." />;
  if (!grievance) return <p className="text-red-600">Grievance not found.</p>;

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800">{grievance.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{grievance.grievanceId}</p>
        <p className="mt-2 text-slate-700">{grievance.description}</p>
        <p className="mt-3 text-sm text-slate-600">Status: {getStatusLabel(grievance.status)}</p>
      </div>

      {(grievance.status === "worker_assigned" || grievance.status === "appealed") ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Start Work</h3>
          <button onClick={startWork} className="mt-3 rounded bg-primary px-4 py-2 text-white">
            Mark In Progress
          </button>
        </div>
      ) : null}

      {grievance.status === "in_progress" ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Mark Resolved</h3>
          <textarea
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            rows={4}
            placeholder="Enter resolution note"
            className="mt-3 w-full rounded border border-slate-300 px-3 py-2"
          />
          <button onClick={resolveWork} className="mt-3 rounded bg-accent px-4 py-2 text-white">
            Mark Resolved
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default WorkerGrievanceDetailPage;
