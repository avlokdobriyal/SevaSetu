import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingState from "../../components/common/LoadingState";
import {
  assignWorkerRequest,
  closeGrievanceRequest,
  getGrievanceByIdRequest,
} from "../../api/grievanceApi";
import { getWorkersRequest } from "../../api/userApi";
import { getStatusLabel } from "../../utils/grievanceMeta";
import getErrorMessage from "../../utils/getErrorMessage";

const OfficerGrievanceDetailPage = () => {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      setIsLoading(true);
      const [gRes, wRes] = await Promise.all([getGrievanceByIdRequest(id), getWorkersRequest()]);
      setGrievance(gRes?.data || null);
      const workerList = wRes?.data || [];
      setWorkers(workerList);
      if (workerList.length > 0) {
        setSelectedWorker(workerList[0]._id);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load details"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedWorker) {
      toast.error("Select a worker first");
      return;
    }

    try {
      const response = await assignWorkerRequest(id, { workerId: selectedWorker });
      setGrievance(response?.data || grievance);
      toast.success("Worker assigned");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to assign worker"));
    }
  };

  const handleClose = async () => {
    try {
      const response = await closeGrievanceRequest(id, { note: "Closed after officer verification" });
      setGrievance(response?.data || grievance);
      toast.success("Grievance closed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to close grievance"));
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

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">Assign Worker</h3>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <select
            value={selectedWorker}
            onChange={(event) => setSelectedWorker(event.target.value)}
            className="rounded border border-slate-300 px-3 py-2"
          >
            {workers.map((worker) => (
              <option key={worker._id} value={worker._id}>
                {worker.name} ({worker.isActive ? "active" : "inactive"})
              </option>
            ))}
          </select>
          <button onClick={handleAssign} className="rounded bg-primary px-4 py-2 text-white">
            Assign Worker
          </button>
        </div>
      </div>

      {grievance.status === "resolved" ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">Close Grievance</h3>
          <p className="mt-1 text-sm text-slate-600">Worker has resolved this issue. Verify and close.</p>
          <button onClick={handleClose} className="mt-3 rounded bg-accent px-4 py-2 text-white">
            Close Grievance
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default OfficerGrievanceDetailPage;
