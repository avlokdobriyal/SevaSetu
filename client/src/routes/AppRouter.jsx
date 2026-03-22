import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminGrievancesPage from "../pages/admin/AdminGrievancesPage";
import AdminOfficersPage from "../pages/admin/AdminOfficersPage";
import AdminWardsPage from "../pages/admin/AdminWardsPage";
import CitizenDashboardPage from "../pages/citizen/CitizenDashboardPage";
import CitizenFileGrievancePage from "../pages/citizen/CitizenFileGrievancePage";
import CitizenGrievanceDetailPage from "../pages/citizen/CitizenGrievanceDetailPage";
import CitizenGrievanceListPage from "../pages/citizen/CitizenGrievanceListPage";
import OfficerGrievanceDetailPage from "../pages/officer/OfficerGrievanceDetailPage";
import OfficerGrievancesPage from "../pages/officer/OfficerGrievancesPage";
import OfficerDashboardPage from "../pages/officer/OfficerDashboardPage";
import LandingPage from "../pages/public/LandingPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import TrackPage from "../pages/public/TrackPage";
import WorkerGrievanceDetailPage from "../pages/worker/WorkerGrievanceDetailPage";
import WorkerGrievancesPage from "../pages/worker/WorkerGrievancesPage";
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
          <Route path="/officer/grievances" element={<OfficerGrievancesPage />} />
          <Route path="/officer/grievances/:id" element={<OfficerGrievanceDetailPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
          <Route path="/worker/grievances" element={<WorkerGrievancesPage />} />
          <Route path="/worker/grievances/:id" element={<WorkerGrievanceDetailPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/wards" element={<AdminWardsPage />} />
          <Route path="/admin/officers" element={<AdminOfficersPage />} />
          <Route path="/admin/grievances" element={<AdminGrievancesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
