import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerRequest } from "../../api/authApi";
import { getAllWardsRequest } from "../../api/wardApi";
import useAuth from "../../hooks/useAuth";
import { getRoleDashboardPath } from "../../utils/roleRedirect";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  ward: "",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [wards, setWards] = useState([]);
  const [isLoadingWards, setIsLoadingWards] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        setIsLoadingWards(true);
        const response = await getAllWardsRequest();
        const wardList = response?.data || [];
        setWards(wardList);
      } catch (error) {
        const message = error?.response?.data?.message || "Could not load wards";
        toast.error(message);
      } finally {
        setIsLoadingWards(false);
      }
    };

    fetchWards();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      formData.name &&
      formData.email &&
      formData.password &&
      formData.phone &&
      formData.address &&
      formData.ward
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await registerRequest(formData);
      const token = response?.data?.token;
      const userData = response?.data?.user;

      if (!token || !userData) {
        throw new Error("Invalid response from server");
      }

      login(token, userData);
      toast.success("Registration successful");
      navigate(getRoleDashboardPath(userData.role), { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Registration failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">Citizen Registration</h2>
      <p className="mt-2 text-slate-600">Create your account to file and track grievances.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            placeholder="Minimum 6 characters"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            placeholder="10-digit mobile"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary"
            placeholder="Complete address"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="ward">
            Ward
          </label>
          <select
            id="ward"
            name="ward"
            value={formData.ward}
            onChange={handleChange}
            disabled={isLoadingWards || wards.length === 0}
            className="w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-primary disabled:bg-slate-100"
          >
            <option value="">
              {isLoadingWards ? "Loading wards..." : "Select your ward"}
            </option>
            {wards.map((ward) => (
              <option key={ward._id} value={ward._id}>
                {ward.name}
              </option>
            ))}
          </select>
          {!isLoadingWards && wards.length === 0 ? (
            <p className="mt-2 text-sm text-red-600">
              No wards found. Please create wards from admin flow or seed script first.
            </p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="w-full rounded bg-primary px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account? <Link to="/login" className="font-medium text-primary">Login</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
