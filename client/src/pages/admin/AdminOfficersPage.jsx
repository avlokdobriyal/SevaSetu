import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingState from "../../components/common/LoadingState";
import { getAllWardsRequest } from "../../api/wardApi";
import {
  createOfficerRequest,
  getOfficersRequest,
  toggleUserActiveRequest,
} from "../../api/userApi";
import getErrorMessage from "../../utils/getErrorMessage";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  wardId: "",
};

const AdminOfficersPage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [wards, setWards] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      setIsLoading(true);
      const [wardsRes, officersRes] = await Promise.all([getAllWardsRequest(), getOfficersRequest()]);
      const wardList = wardsRes?.data || [];
      setWards(wardList);
      setOfficers(officersRes?.data || []);
      setFormData((prev) => ({ ...prev, wardId: prev.wardId || wardList[0]?._id || "" }));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load data"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createOfficer = async (event) => {
    event.preventDefault();

    try {
      await createOfficerRequest(formData);
      toast.success("Officer created");
      setFormData((prev) => ({ ...initialForm, wardId: prev.wardId }));
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create officer"));
    }
  };

  const toggleActive = async (officerId) => {
    try {
      await toggleUserActiveRequest(officerId);
      toast.success("Officer status updated");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status"));
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading officers and wards..." />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800">Manage Officers</h2>
        <form onSubmit={createOfficer} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input name="name" value={formData.name} onChange={onChange} placeholder="Name" className="rounded border border-slate-300 px-3 py-2" />
          <input name="email" value={formData.email} onChange={onChange} placeholder="Email" className="rounded border border-slate-300 px-3 py-2" />
          <input name="password" value={formData.password} onChange={onChange} placeholder="Password" className="rounded border border-slate-300 px-3 py-2" />
          <input name="phone" value={formData.phone} onChange={onChange} placeholder="Phone" className="rounded border border-slate-300 px-3 py-2" />
          <input name="address" value={formData.address} onChange={onChange} placeholder="Address" className="rounded border border-slate-300 px-3 py-2" />
          <select name="wardId" value={formData.wardId} onChange={onChange} className="rounded border border-slate-300 px-3 py-2">
            {wards.map((ward) => (
              <option key={ward._id} value={ward._id}>{ward.name}</option>
            ))}
          </select>
          <button className="rounded bg-primary px-4 py-2 text-white md:col-span-3">Create Officer</button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Ward</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer) => (
                <tr key={officer._id} className="border-b">
                  <td className="px-3 py-2">{officer.name}</td>
                  <td className="px-3 py-2">{officer.email}</td>
                  <td className="px-3 py-2">{officer?.ward?.name || "-"}</td>
                  <td className="px-3 py-2">{officer.isActive ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">
                    <button className="text-primary" onClick={() => toggleActive(officer._id)}>
                      {officer.isActive ? "Deactivate" : "Activate"}
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

export default AdminOfficersPage;
