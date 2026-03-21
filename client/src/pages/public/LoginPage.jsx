import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginRequest } from "../../api/authApi";
import useAuth from "../../hooks/useAuth";
import { getRoleDashboardPath } from "../../utils/roleRedirect";

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await loginRequest(formData);
      const token = response?.data?.token;
      const userData = response?.data?.user;

      if (!token || !userData) {
        throw new Error("Invalid response from server");
      }

      login(token, userData);
      toast.success("Login successful");
      navigate(getRoleDashboardPath(userData.role), { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "Login failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-800">Login</h2>
      <p className="mt-2 text-slate-600">Use your account credentials to access SevaSetu.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-primary px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        New citizen? <Link to="/register" className="font-medium text-primary">Create account</Link>
      </p>
    </section>
  );
};

export default LoginPage;
