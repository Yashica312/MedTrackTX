import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Clock3,
  FileSearch,
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

import { useDashboard } from "../hooks/useDashboard";

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
        <div className="stat-label">
          {label}
        </div>

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

  // =========================================================
  // DASHBOARD API
  // =========================================================

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useDashboard();


  // =========================================================
  // REAL BACKEND DATA
  // =========================================================

  const totalPatients =
    data?.total_patients ?? 0;

  const totalVisits =
    data?.total_visits ?? 0;

  const totalDoctors =
    data?.total_doctors ?? 0;

  const totalAiAnalyses =
    data?.total_ai_analyses ?? 0;


  const patients =
    data?.recent_patients ?? [];

  const visits =
    data?.recent_visits ?? [];

  const predictions =
    data?.recent_predictions ?? [];


  const riskDistribution =
    data?.risk_distribution ?? {
      low: 0,
      moderate: 0,
      high: 0,
    };


  // =========================================================
  // RECENT VISITS
  // =========================================================

  const recentVisits = useMemo(() => {

    return [...visits]
      .sort((a, b) => {

        const aDate = new Date(
          a.visit_date ??
          a.created_at ??
          ""
        ).getTime();

        const bDate = new Date(
          b.visit_date ??
          b.created_at ??
          ""
        ).getTime();

        return bDate - aDate;
      })
      .slice(0, 5);

  }, [visits]);


  // =========================================================
  // RECENT PATIENTS
  // =========================================================

  const recentPatients = useMemo(() => {

    return [...patients]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

  }, [patients]);


  // =========================================================
  // VISIT TREND
  // =========================================================

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

    const currentYear =
      new Date().getFullYear();

    return months.map(
      (month, index) => {

        const count = visits.filter(
          (visit) => {

            const date = new Date(
              visit.visit_date ??
              visit.created_at ??
              ""
            );

            return (
              !Number.isNaN(
                date.getTime()
              ) &&
              date.getFullYear() ===
                currentYear &&
              date.getMonth() === index
            );
          }
        ).length;

        return {
          month,
          visits: count,
        };
      }
    );

  }, [visits]);


  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {

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

        </div>


        <div className="dashboard-loading-grid">

          {Array.from({
            length: 4,
          }).map((_, index) => (

            <div
              key={index}
              className="dashboard-skeleton-card"
            />

          ))}

        </div>

      </section>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (isError) {

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

        </div>


        <div className="api-warning-card">

          <AlertTriangle size={20} />

          <div>

            <strong>
              Unable to load dashboard
            </strong>

            <p>
              Please check your backend connection
              and try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="dashboard-retry-button"
            >
              Retry
            </button>

          </div>

        </div>

      </section>
    );
  }


  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <section className="dashboard-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

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


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="dashboard-stat-grid">

        <StatCard
          label="Total Patients"
          value={totalPatients}
          tone="blue"
          icon={<Users size={19} />}
        />


        <StatCard
          label="Total Visits"
          value={totalVisits}
          tone="green"
          icon={<CalendarDays size={19} />}
        />


        <StatCard
          label="Doctors"
          value={totalDoctors}
          tone="purple"
          icon={<Activity size={19} />}
        />


        <StatCard
          label="AI Analyses"
          value={totalAiAnalyses}
          tone="red"
          icon={<FileSearch size={19} />}
        />

      </div>


      {/* =====================================================
          MAIN DASHBOARD
      ====================================================== */}

      <div className="dashboard-main-grid">


        {/* ===================================================
            RISK DISTRIBUTION
        ==================================================== */}

        <div
          className="dashboard-card risk-card"
          style={{ minHeight: "300px", overflow: "hidden" }}
        >
          <div className="dashboard-card-header">
            <div>
              <h2>Risk Level Distribution</h2>
              <span>Based on completed AI analyses</span>
            </div>
          </div>

          {totalAiAnalyses === 0 ? (
            <div className="analysis-empty-state">
              <div className="analysis-empty-icon">
                <AlertTriangle size={22} />
              </div>
              <strong>No AI analyses yet</strong>
              <p>
                Risk distribution will appear here after lesion
                analysis is completed.
              </p>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "18px",
                  borderBottom: "1px solid #edf2f7",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "9px", height: "9px", minWidth: "9px", borderRadius: "50%", background: "#6b8e72", display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "#334155" }}>Low Risk</span>
                </div>
                <strong style={{ fontSize: "18px", fontWeight: 700, color: "#17324d" }}>
                  {riskDistribution.low}
                </strong>
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "18px",
                  borderBottom: "1px solid #edf2f7",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "9px", height: "9px", minWidth: "9px", borderRadius: "50%", background: "#b18b4d", display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "#334155" }}>Moderate Risk</span>
                </div>
                <strong style={{ fontSize: "18px", fontWeight: 700, color: "#17324d" }}>
                  {riskDistribution.moderate}
                </strong>
              </div>

              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "9px", height: "9px", minWidth: "9px", borderRadius: "50%", background: "#a95b5b", display: "inline-block" }} />
                  <span style={{ fontSize: "13px", color: "#334155" }}>High Risk</span>
                </div>
                <strong style={{ fontSize: "18px", fontWeight: 700, color: "#17324d" }}>
                  {riskDistribution.high}
                </strong>
              </div>
            </div>
          )}
        </div>


        <div className="dashboard-card recent-analysis-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Recent Clinical Activity
              </h2>

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

                    <th>
                      Visit ID
                    </th>

                    <th>
                      Patient
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentVisits.map(
                    (visit) => {

                      const patient =
                        patients.find(
                          (item) =>
                            item.id ===
                            visit.patient_id
                        );


                      return (
                        <tr
                          key={visit.id}
                        >

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
                                  `Patient ${
                                    visit.patient_id ??
                                    "—"
                                  }`}

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

                              <CircleCheck
                                size={12}
                              />

                              Recorded

                            </span>

                          </td>

                        </tr>
                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* ===================================================
            VISIT TREND
        ==================================================== */}

        <div className="dashboard-card trend-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Visit Trend
              </h2>

              <span>
                Current-year clinical visits
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


      {/* =====================================================
          RECENT AI ANALYSES
      ====================================================== */}

      <div className="dashboard-card">

        <div className="dashboard-card-header">

          <div>

            <h2>
              Recent AI Analyses
            </h2>

            <span>
              Latest lesion analysis results
            </span>

          </div>

          <a
            href="/analysis"
            className="dashboard-card-link"
          >
            View all
          </a>

        </div>


        {predictions.length === 0 ? (

          <div className="table-empty-state">

            No AI analyses completed yet.

          </div>

        ) : (

          <div className="dashboard-table-wrapper">

            <table className="dashboard-table">

              <thead>

                <tr>

                  <th>
                    Analysis
                  </th>

                  <th>
                    Prediction
                  </th>

                  <th>
                    Confidence
                  </th>

                  <th>
                    Risk
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {predictions.map(
                  (prediction) => {

                    const risk =
                      prediction.risk_level
                        ?.toLowerCase() ?? "";


                    let statusClass =
                      "status-success";

                    if (
                      risk.includes("high")
                    ) {
                      statusClass =
                        "status-danger";

                    } else if (
                      risk.includes(
                        "moderate"
                      ) ||
                      risk.includes(
                        "medium"
                      )
                    ) {
                      statusClass =
                        "status-warning";
                    }


                    return (
                      <tr
                        key={
                          prediction.id
                        }
                      >

                        <td>

                          <span className="table-id">
                            ANA-{prediction.id}
                          </span>

                        </td>


                        <td>

                          {prediction.predicted_class}

                        </td>


                        <td>

                          {Number(
                            prediction.confidence
                          ).toFixed(1)}
                          %

                        </td>


                        <td>

                          <span
                            className={`status-badge ${statusClass}`}
                          >

                            {prediction.risk_level}

                          </span>

                        </td>


                        <td>

                          {formatDate(
                            prediction.prediction_time
                          )}

                        </td>

                      </tr>
                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          BOTTOM SECTION
      ====================================================== */}

      <div className="dashboard-bottom-grid">


        {/* ===================================================
            RECENT PATIENTS
        ==================================================== */}

        <div className="dashboard-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Recent Patients
              </h2>

              <span>
                Patients currently assigned to you
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

              recentPatients.map(
                (patient) => (

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
                        Patient ID · PT-
                        {patient.id}
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

                )
              )

            )}

          </div>

        </div>


        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <div className="dashboard-card">

          <div className="dashboard-card-header">

            <div>

              <h2>
                Clinical Quick Actions
              </h2>

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

                <strong>
                  Manage Patients
                </strong>

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

                <strong>
                  Clinical Visits
                </strong>

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

                <strong>
                  Start AI Analysis
                </strong>

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

                <strong>
                  Clinical Reports
                </strong>

                <span>
                  Review and generate reports
                </span>

              </div>

            </a>

          </div>

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="dashboard-footer-note">

        <Clock3 size={14} />

        <span>
          Live data is retrieved directly from
          the MedTrack-TX backend.
        </span>

        <span className="footer-separator">
          •
        </span>

        <span>
          AI results are shown only after an
          actual analysis is completed.
        </span>

      </div>

    </section>
  );
}