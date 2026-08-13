import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import Dashboard from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";

import PatientsPage from "../pages/patients/PatientsPage";

import VisitsPage from "../pages/visits/VisitsPage";
import NewVisitPage from "../pages/visits/NewVisitPage";
import VisitDetailsPage from "../pages/visits/VisitDetailsPage";
import EditVisitPage from "../pages/visits/EditVisitPage";

import AnalysisPage from "../pages/analysis/AnalysisPage";
import ReportsPage from "../pages/ReportsPage";

import ProtectedRoute from "./ProtectedRoute";


function PlaceholderPage({
  title,
}: {
  title: string;
}) {
  return (
    <section className="page-placeholder">
      <div className="page-heading">
        <span className="eyebrow">
          MEDTRACK-TX
        </span>

        <h1>{title}</h1>
      </div>

      <div className="placeholder-card">
        <h2>{title}</h2>

        <p>
          This module is ready for implementation.
        </p>
      </div>
    </section>
  );
}


export default function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/login"
        element={<LoginPage />}
      />


      {/* =====================================================
          PROTECTED APPLICATION
      ===================================================== */}

      <Route element={<ProtectedRoute />}>

        <Route element={<AppLayout />}>

          {/* =================================================
              DEFAULT
          ================================================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />


          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* =================================================
              PATIENTS
          ================================================= */}

          <Route
            path="/patients"
            element={<PatientsPage />}
          />


          {/* =================================================
              DOCTORS
          ================================================= */}

          <Route
            path="/doctors"
            element={
              <PlaceholderPage
                title="Doctors"
              />
            }
          />


          {/* =================================================
              VISITS
          ================================================= */}

          {/* Visit list */}

          <Route
            path="/visits"
            element={<VisitsPage />}
          />


          {/* Create new visit */}

          <Route
            path="/visits/new"
            element={<NewVisitPage />}
          />


          {/* View visit details */}

          <Route
            path="/visits/:visitId"
            element={<VisitDetailsPage />}
          />


          {/* Edit visit */}

          <Route
            path="/visits/:visitId/edit"
            element={<EditVisitPage />}
          />


          {/* =================================================
              LESION ANALYSIS
          ================================================= */}

          <Route
            path="/analysis"
            element={<AnalysisPage />}
          />


          {/* =================================================
              REPORTS
          ================================================= */}

          <Route
            path="/reports"
            element={<ReportsPage />}
          />


          {/* =================================================
              ANALYTICS
          ================================================= */}

          <Route
            path="/analytics"
            element={
              <PlaceholderPage
                title="Analytics"
              />
            }
          />


          {/* =================================================
              SETTINGS
          ================================================= */}

          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
              />
            }
          />


          {/* =================================================
              UNKNOWN ROUTE
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Route>

      </Route>

    </Routes>
  );
}