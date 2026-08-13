import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock3,
  FileSearch,
  Plus,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fetchPatients } from "../api/patients";
import { fetchDoctors } from "../api/doctors";
import { fetchVisits } from "../api/visits";

interface Visit {
  id: number;
  patient_id?: number;
  doctor_id?: number;
  visit_date?: string;
  symptoms?: string;
  notes?: string;
  created_at?: string;
}

function formatDate(date?: string) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  icon,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "purple" | "red";
}) {
  return (
    <div className={`dashboard-stat-card tone-${tone}`}>
      <div className="stat-card-top">
        <div className="stat-label">{label}</div>

        <div className="stat-icon">
          {icon}
        </div>
      </div>

      <div className="stat-value">
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
  });

  const doctorsQuery = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const visitsQuery = useQuery({
    queryKey: ["visits"],
    queryFn: fetchVisits,
  });

  const patients = patientsQuery.data ?? [];
  const doctors = doctorsQuery.data ?? [];
  const visits = (visitsQuery.data ?? []) as Visit[];

  const recentPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => {
        const aId = Number(a.id) || 0;
        const bId = Number(b.id) || 0;
        return bId - aId;
      })
      .slice(0, 5);
  }, [patients]);

  const recentVisits = useMemo(() => {
    return [...visits]
      .sort((a, b) => {
        const aDate = new Date(
          a.visit_date ?? a.created_at ?? ""
        ).getTime();

        const bDate = new Date(
          b.visit_date ?? b.created_at ?? ""
        ).getTime();

        return bDate - aDate;
      })
      .slice(0, 5);
  }, [visits]);

  const monthlyVisits = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = months.map((month, index) => ({
      month,
      visits: visits.filter((visit) => {
        const date = new Date(
          visit.visit_date ?? visit.created_at ?? ""
        );

        return (
          !Number.isNaN(date.getTime()) &&
          date.getMonth() === index
        );
      }).length,
    }));

    return result;
  }, [visits]);

  const loading =
    patientsQuery.isLoading ||
    doctorsQuery.isLoading ||
    visitsQuery.isLoading;

  const hasError =
    patientsQuery.isError ||
    doctorsQuery.isError ||
    visitsQuery.isError;

  return (
    <section className="dashboard-page">
      <div className="dashboard-header-row">
        <div>
          <div className="page-breadcrumb">
            Home / Dashboard
          </div>

          <h1 className="dashboard-title">
            Dashboard
          </h1>

          <p className="dashboard-subtitle">
            Institutional dermatology patient monitoring
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button
            type="button"
            className="date-selector"
          >
            <CalendarDays size={15} />
            <span>
              Clinical overview
            </span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {hasError && (
        <div className="api-warning-card">
          <AlertTriangle size={18} />

          <div>
            <strong>
              Unable to load some clinical data
            </strong>

            <p>
              Please make sure the FastAPI backend is running
              at the configured API address.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="dashboard-skeleton-card"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="dashboard-stat-grid">
            <StatCard
              label="Total Patients"
              value={patients.length}
              tone="blue"
              icon={<Users size={19} />}
            />

            <StatCard
              label="Total Visits"
              value={visits.length}
              tone="green"
              icon={<CalendarDays size={19} />}
            />

            <StatCard
              label="Doctors"
              value={doctors.length}
              tone="purple"
              icon={<Activity size={19} />}
            />

            <StatCard
              label="AI Analyses"
              value="—"
              tone="red"
              icon={<FileSearch size={19} />}
            />
          </div>

          <div className="dashboard-main-grid">
            <div className="dashboard-card risk-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>Risk Level Distribution</h2>
                  <span>
                    Available AI assessment data
                  </span>
                </div>
              </div>

              <div className="analysis-empty-state">
                <div className="analysis-empty-icon">
                  <AlertTriangle size={22} />
                </div>

                <strong>
                  No stored analysis records
                </strong>

                <p>
                  Risk distribution will appear here after
                  real AI analyses are completed.
                </p>
              </div>
            </div>

            <div className="dashboard-card recent-analysis-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>Recent Clinical Activity</h2>
                  <span>
                    Latest recorded visits
                  </span>
                </div>
              </div>

              {recentVisits.length === 0 ? (
                <div className="table-empty-state">
                  No visits recorded yet.
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Visit ID</th>
                        <th>Patient</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentVisits.map((visit) => {
                        const patient =
                          patients.find(
                            (item) =>
                              item.id === visit.patient_id
                          );

                        return (
                          <tr key={visit.id}>
                            <td>
                              <span className="table-id">
                                VST-{visit.id}
                              </span>
                            </td>

                            <td>
                              <div className="patient-cell">
                                <div className="patient-avatar">
                                  {(
                                    patient?.full_name ??
                                    "P"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <span>
                                  {patient?.full_name ??
                                    `Patient ${visit.patient_id ?? "—"}`}
                                </span>
                              </div>
                            </td>

                            <td>
                              {formatDate(
                                visit.visit_date ??
                                  visit.created_at
                              )}
                            </td>

                            <td>
                              <span className="status-badge status-success">
                                <CircleCheck size={12} />
                                Recorded
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="dashboard-card trend-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>Visit Trend</h2>
                  <span>
                    Actual visits returned by backend
                  </span>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={monthlyVisits}
                    margin={{
                      top: 10,
                      right: 8,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      stroke="#e7ebf0"
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{
                        fill: "#748092",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: "#748092",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#2475b9"
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        fill: "#2475b9",
                      }}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dashboard-bottom-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>Recent Patients</h2>
                  <span>
                    Patients currently stored in PostgreSQL
                  </span>
                </div>

                <a
                  href="/patients"
                  className="dashboard-card-link"
                >
                  View all
                </a>
              </div>

              <div className="dashboard-patient-list">
                {recentPatients.length === 0 ? (
                  <div className="table-empty-state">
                    No patient records found.
                  </div>
                ) : (
                  recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="dashboard-patient-row"
                    >
                      <div className="dashboard-patient-avatar">
                        {patient.full_name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="dashboard-patient-info">
                        <strong>
                          {patient.full_name}
                        </strong>

                        <span>
                          Patient ID · PT-{patient.id}
                        </span>
                      </div>

                      <div className="patient-meta">
                        <span>
                          {patient.age} yrs
                        </span>

                        <span>
                          {patient.gender}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>Clinical Quick Actions</h2>
                  <span>
                    Common clinical workflows
                  </span>
                </div>
              </div>

              <div className="quick-actions-grid">
                <a
                  href="/patients"
                  className="quick-action-card"
                >
                  <Users size={19} />
                  <div>
                    <strong>Manage Patients</strong>
                    <span>
                      Search and update patient records
                    </span>
                  </div>
                </a>

                <a
                  href="/visits"
                  className="quick-action-card"
                >
                  <CalendarDays size={19} />
                  <div>
                    <strong>Clinical Visits</strong>
                    <span>
                      Review and manage encounters
                    </span>
                  </div>
                </a>

                <a
                  href="/analysis"
                  className="quick-action-card"
                >
                  <Activity size={19} />
                  <div>
                    <strong>Start AI Analysis</strong>
                    <span>
                      Analyze a dermoscopic image
                    </span>
                  </div>
                </a>

                <a
                  href="/reports"
                  className="quick-action-card"
                >
                  <FileSearch size={19} />
                  <div>
                    <strong>Clinical Reports</strong>
                    <span>
                      Review and generate reports
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="dashboard-footer-note">
        <Clock3 size={14} />
        <span>
          Live data is retrieved directly from the MedTrack-TX
          backend.
        </span>

        <span className="footer-separator">•</span>

        <span>
          AI results are shown only after an actual analysis is
          completed.
        </span>
      </div>
    </section>
  );
}