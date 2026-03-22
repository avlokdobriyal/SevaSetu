import { Link, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const navLinks =
    user?.role === "citizen"
      ? [
          { to: "/citizen/dashboard", label: "Dashboard" },
          { to: "/citizen/file", label: "File Grievance" },
          { to: "/citizen/grievances", label: "My Grievances" },
        ]
      : user?.role === "officer"
        ? [
            { to: "/officer/dashboard", label: "Dashboard" },
            { to: "/officer/grievances", label: "Ward Grievances" },
          ]
        : user?.role === "worker"
          ? [
              { to: "/worker/dashboard", label: "Dashboard" },
              { to: "/worker/grievances", label: "Assigned Grievances" },
            ]
          : user?.role === "admin"
            ? [
                { to: "/admin/dashboard", label: "Analytics" },
                { to: "/admin/wards", label: "Manage Wards" },
                { to: "/admin/officers", label: "Manage Officers" },
                { to: "/admin/grievances", label: "All Grievances" },
              ]
            : [{ to: "/", label: "Home" }];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-primary">SevaSetu</h2>
          <p className="mt-1 text-sm text-slate-500">Role: {user?.role || "unknown"}</p>

          <nav className="mt-6 space-y-2 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                className="block rounded px-3 py-2 hover:bg-slate-100"
                to={link.to}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={logout}
              className="w-full rounded bg-accent px-3 py-2 text-white"
            >
              Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
