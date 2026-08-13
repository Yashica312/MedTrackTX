import { useEffect, useState } from "react";
import { apiClient } from "../api/client";

interface Report {
  id: number;
  patient_id: number;
  visit_id: number;
  report_path: string;
  generated_at?: string | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000";

  // ============================================================
  // LOAD REPORTS
  // ============================================================

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiClient.get<Report[]>("/reports/");

      setReports(response.data);

    } catch (err: any) {
      console.error(
        "Failed to load reports:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load reports."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  // ============================================================
  // PDF URL
  // ============================================================

  function getPdfUrl(reportId: number) {
    return `${API_BASE_URL}/reports/${reportId}/pdf`;
  }

  // ============================================================
  // VIEW PDF
  // ============================================================

  function handleViewPdf(reportId: number) {
    const url = getPdfUrl(reportId);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  async function handleDownloadPdf(
    report: Report
  ) {
    try {
      const response =
        await apiClient.get(
          `/reports/${report.id}/pdf`,
          {
            responseType: "blob",
          }
        );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `MedTrack_Report_Patient_${report.patient_id}_Visit_${report.visit_id}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(
        "Failed to download report:",
        err
      );

      alert(
        "Failed to download the report."
      );
    }
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(
    date?: string | null
  ) {
    if (!date) {
      return "N/A";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleString();
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <section className="page-placeholder">

        <div className="page-heading">

          <span className="eyebrow">
            MEDTRACK-TX
          </span>

          <h1>Clinical Reports</h1>

          <p>
            Loading generated clinical reports...
          </p>

        </div>

        <div className="placeholder-card">

          <p>
            Loading reports...
          </p>

        </div>

      </section>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <section className="page-placeholder">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-heading">

        <span className="eyebrow">
          MEDTRACK-TX
        </span>

        <h1>
          Clinical Reports
        </h1>

        <p>
          Review and download AI-assisted
          clinical lesion analysis reports.
        </p>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "10px",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!error && reports.length === 0 && (
        <div className="placeholder-card">

          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
            }}
          >

            <h2>
              No reports available
            </h2>

            <p
              style={{
                marginTop: "8px",
                color: "#64748b",
              }}
            >
              Clinical reports will appear here
              after lesion analysis is completed.
            </p>

          </div>

        </div>
      )}

      {/* =====================================================
          REPORT LIST
      ===================================================== */}

      {reports.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >

          {reports.map((report) => (

            <div
              key={report.id}
              className="placeholder-card"
              style={{
                padding: "22px",
              }}
            >

              {/* ---------------------------------------------
                  REPORT HEADER
              --------------------------------------------- */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >

                <div>

                  <span
                    className="eyebrow"
                  >
                    CLINICAL REPORT
                  </span>

                  <h2
                    style={{
                      marginTop: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    Report #{report.id}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                    }}
                  >
                    Generated{" "}
                    {formatDate(
                      report.generated_at
                    )}
                  </p>

                </div>

                {/* -----------------------------------------
                    ACTIONS
                ----------------------------------------- */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >

                  <button
                    type="button"
                    onClick={() =>
                      handleViewPdf(
                        report.id
                      )
                    }
                  >
                    View PDF
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadPdf(
                        report
                      )
                    }
                  >
                    Download PDF
                  </button>

                </div>

              </div>

              {/* ---------------------------------------------
                  DETAILS
              --------------------------------------------- */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginTop: "22px",
                }}
              >

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    PATIENT
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                    }}
                  >
                    Patient #{report.patient_id}
                  </strong>

                </div>

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    VISIT
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                    }}
                  >
                    Visit #{report.visit_id}
                  </strong>

                </div>

                <div
                  style={{
                    padding: "14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                  }}
                >

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    FORMAT
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "5px",
                    }}
                  >
                    PDF
                  </strong>

                </div>

              </div>

              {/* ---------------------------------------------
                  REPORT CONTENT INFO
              --------------------------------------------- */}

              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "18px",
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >

                <p
                  style={{
                    margin: 0,
                    color: "#475569",
                    fontSize: "14px",
                  }}
                >
                  This report contains AI-assisted
                  lesion analysis including temporal
                  comparison, lesion change assessment,
                  ABCDE evaluation, U-Net segmentation,
                  Grad-CAM explainability and clinical
                  summary.
                </p>

              </div>

            </div>

          ))}

        </div>
      )}

    </section>
  );
}