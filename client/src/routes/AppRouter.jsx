import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import CitizenDashboardPage from "../pages/citizen/CitizenDashboardPage";
import CitizenFileGrievancePage from "../pages/citizen/CitizenFileGrievancePage";
import CitizenGrievanceDetailPage from "../pages/citizen/CitizenGrievanceDetailPage";
import CitizenGrievanceListPage from "../pages/citizen/CitizenGrievanceListPage";
import OfficerDashboardPage from "../pages/officer/OfficerDashboardPage";
import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import TrackPage from "../pages/public/TrackPage";
import WorkerDashboardPage from "../pages/worker/WorkerDashboardPage";
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["citizen"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboardPage />} />
          <Route path="/citizen/file" element={<CitizenFileGrievancePage />} />
          <Route path="/citizen/grievances" element={<CitizenGrievanceListPage />} />
          <Route path="/citizen/grievances/:id" element={<CitizenGrievanceDetailPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["officer"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/officer/dashboard" element={<OfficerDashboardPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
