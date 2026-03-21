import { useState } from "react";

const TrackPage = () => {
  const [grievanceId, setGrievanceId] = useState("");

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">Track Grievance</h2>
      <p className="mt-2 text-slate-600">Enter a grievance ID to track status publicly.</p>

      <form className="mt-5 flex max-w-xl gap-3">
        <input
          value={grievanceId}
          onChange={(e) => setGrievanceId(e.target.value)}
          placeholder="Example: GRV-2026-00001"
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button type="button" className="rounded bg-primary px-4 py-2 font-medium text-white">
          Search
        </button>
      </form>
    </section>
  );
};

export default TrackPage;
