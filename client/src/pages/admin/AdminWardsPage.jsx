import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingState from "../../components/common/LoadingState";
import {
  createWardRequest,
  deleteWardRequest,
  getAllWardsRequest,
  updateWardRequest,
} from "../../api/wardApi";
import getErrorMessage from "../../utils/getErrorMessage";

const AdminWardsPage = () => {
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    try {
      setIsLoading(true);
      const response = await getAllWardsRequest();
      setWards(response?.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load wards"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createWard = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    try {
      await createWardRequest({ name, description });
      setName("");
      setDescription("");
      toast.success("Ward created");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create ward"));
    }
  };

  const renameWard = async (ward) => {
    const nextName = window.prompt("Enter new ward name", ward.name);
    if (!nextName || nextName === ward.name) return;

    try {
      await updateWardRequest(ward._id, { name: nextName });
      toast.success("Ward updated");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update ward"));
    }
  };

  const removeWard = async (ward) => {
    const shouldDelete = window.confirm(`Delete ${ward.name}?`);
    if (!shouldDelete) return;

    try {
      await deleteWardRequest(ward._id);
      toast.success("Ward deleted");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete ward"));
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading wards..." />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800">Manage Wards</h2>
        <form onSubmit={createWard} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ward name"
            className="rounded border border-slate-300 px-3 py-2"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            className="rounded border border-slate-300 px-3 py-2"
          />
          <button className="rounded bg-primary px-4 py-2 text-white">Create Ward</button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Officer</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wards.map((ward) => (
                <tr key={ward._id} className="border-b">
                  <td className="px-3 py-2">{ward.name}</td>
                  <td className="px-3 py-2">{ward?.officer?.name || "Unassigned"}</td>
                  <td className="px-3 py-2 space-x-3">
                    <button className="text-primary" onClick={() => renameWard(ward)}>
                      Edit
                    </button>
                    <button className="text-red-600" onClick={() => removeWard(ward)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminWardsPage;
