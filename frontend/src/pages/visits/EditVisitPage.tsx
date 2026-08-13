import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../api/client";

interface VisitData {
  id: number;
  patient_id: number;
  visit_date: string;
  symptoms?: string;
  doctor_notes?: string;
}

export default function EditVisitPage() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();

  const [visit, setVisit] = useState<VisitData | null>(null);

  const [visitDate, setVisitDate] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVisit() {
      try {
        if (!visitId) {
          throw new Error("Invalid visit ID.");
        }

        const response = await apiClient.get<VisitData>(
          `/visits/${visitId}`
        );

        const data = response.data;

        setVisit(data);
        setVisitDate(data.visit_date || "");
        setSymptoms(data.symptoms || "");
        setDoctorNotes(data.doctor_notes || "");
      } catch (err: any) {
        console.error("Failed to load visit:", err);

        setError(
          err?.response?.data?.detail ||
            "Failed to load visit."
        );
      } finally {
        setLoading(false);
      }
    }

    loadVisit();
  }, [visitId]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!visitId) {
      setError("Invalid visit ID.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiClient.put(
        `/visits/${visitId}`,
        {
          visit_date: visitDate,
          symptoms: symptoms || null,
          doctor_notes: doctorNotes || null,
        }
      );

      navigate(`/visits/${visitId}`);
    } catch (err: any) {
      console.error("Failed to update visit:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to update visit."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="page-placeholder">
        <div className="page-heading">
          <span className="eyebrow">
            MEDTRACK-TX
          </span>

          <h1>Edit Visit</h1>
        </div>

        <div className="placeholder-card">
          <p>Loading visit...</p>
        </div>
      </section>
    );
  }

  if (!visit) {
    return (
      <section className="page-placeholder">
        <div className="page-heading">
          <span className="eyebrow">
            MEDTRACK-TX
          </span>

          <h1>Edit Visit</h1>
        </div>

        <div className="placeholder-card">
          <h2>Unable to load visit</h2>

          <p>
            {error || "Visit not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/visits")}
          >
            Back to Visits
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page-placeholder">

      {/* Header */}
      <div className="page-heading">
        <span className="eyebrow">
          MEDTRACK-TX
        </span>

        <h1>Edit Visit</h1>

        <p>
          Update clinical visit information.
        </p>
      </div>

      {/* Form */}
      <div className="placeholder-card">

        {error && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "20px",
              background: "#fee2e2",
              color: "#991b1b",
              borderRadius: "8px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Patient */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <strong>Patient</strong>
            </label>

            <input
              type="text"
              value={`Patient #${visit.patient_id}`}
              disabled
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
              }}
            />
          </div>

          {/* Visit Date */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <strong>Visit Date</strong>
            </label>

            <input
              type="date"
              value={visitDate}
              onChange={(e) =>
                setVisitDate(e.target.value)
              }
              required
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
              }}
            />
          </div>

          {/* Symptoms */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <strong>Symptoms</strong>
            </label>

            <textarea
              value={symptoms}
              onChange={(e) =>
                setSymptoms(e.target.value)
              }
              placeholder="Describe the patient's symptoms..."
              rows={5}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Doctor Notes */}
          <div style={{ marginBottom: "20px" }}>
            <label>
              <strong>Doctor Notes</strong>
            </label>

            <textarea
              value={doctorNotes}
              onChange={(e) =>
                setDoctorNotes(e.target.value)
              }
              placeholder="Enter clinical observations and notes..."
              rows={5}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "25px",
            }}
          >

            <button
              type="button"
              onClick={() =>
                navigate(`/visits/${visitId}`)
              }
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Update Visit"}
            </button>

          </div>

        </form>

      </div>
    </section>
  );
}