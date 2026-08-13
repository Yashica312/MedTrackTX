import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/DashboardPage";
import PatientsPage from "../pages/patients/PatientsPage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page-placeholder">
      <div className="page-heading">
        <span className="eyebrow">MEDTRACK-TX</span>
        <h1>{title}</h1>
      </div>

      <div className="placeholder-card">
        <h2>{title}</h2>
        <p>This module is ready for implementation.</p>
      </div>
    </section>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/patients"
          element={<PatientsPage />}
        />

        <Route
          path="/doctors"
          element={<PlaceholderPage title="Doctors" />}
        />

        <Route
          path="/visits"
          element={<PlaceholderPage title="Visits" />}
        />

        <Route
          path="/analysis"
          element={<PlaceholderPage title="Lesion Analysis" />}
        />

        <Route
          path="/reports"
          element={<PlaceholderPage title="Reports" />}
        />

        <Route
          path="/analytics"
          element={<PlaceholderPage title="Analytics" />}
        />

        <Route
          path="/settings"
          element={<PlaceholderPage title="Settings" />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboardPage" replace />}
        />
      </Route>
    </Routes>
  );
}