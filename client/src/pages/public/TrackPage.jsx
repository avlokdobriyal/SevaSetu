import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getPublicGrievanceByIdRequest } from "../../api/grievanceApi";
import { getStatusLabel } from "../../utils/grievanceMeta";
import getErrorMessage from "../../utils/getErrorMessage";

const TrackPage = () => {
  const [grievanceId, setGrievanceId] = useState("");
  const [grievance, setGrievance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const timeline = useMemo(() => {
    return (grievance?.statusHistory || []).slice().sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [grievance]);

  const handleSearch = async () => {
    if (!grievanceId.trim()) {
      toast.error("Please enter grievance ID");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getPublicGrievanceByIdRequest(grievanceId.trim());
      setGrievance(response?.data || null);
    } catch (error) {
      setGrievance(null);
      toast.error(getErrorMessage(error, "Grievance not found"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">Track Grievance</h2>
      <p className="mt-2 text-slate-600">Enter a grievance ID to track status publicly.</p>

      <form
        className="mt-5 flex max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <input
          value={grievanceId}
          onChange={(e) => setGrievanceId(e.target.value)}
          placeholder="Example: GRV-2026-00001"
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button type="submit" className="rounded bg-primary px-4 py-2 font-medium text-white">
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {grievance ? (
        <div className="mt-8 rounded border border-slate-200 p-5">
          <h3 className="text-xl font-semibold text-slate-800">{grievance.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{grievance.grievanceId}</p>
          <div className="mt-3 text-sm text-slate-700">
            <p>Current Status: {getStatusLabel(grievance.status)}</p>
            <p>Ward: {grievance?.ward?.name || "N/A"}</p>
            <p>Overdue: {grievance.isOverdue ? "Yes" : "No"}</p>
          </div>

          <div className="mt-4 space-y-3">
            {timeline.map((entry, index) => (
              <div key={`${entry.status}-${index}`} className="rounded border border-slate-200 p-3">
                <p className="font-medium text-slate-800">{getStatusLabel(entry.status)}</p>
                <p className="text-xs text-slate-600">{new Date(entry.timestamp).toLocaleString()}</p>
                <p className="text-sm text-slate-700">{entry.note || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default TrackPage;
