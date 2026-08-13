import { useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  useCreatePatient,
  useDeletePatient,
  usePatients,
  useUpdatePatient,
} from "../../hooks/usePatients";
import type {
  Patient,
  PatientCreate,
  PatientUpdate,
} from "../../api/patients";

const EMPTY_FORM: PatientCreate = {
  full_name: "",
  age: 0,
  gender: "",
  phone: "",
  email: "",
  address: "",
};

function PatientModal({
  patient,
  onClose,
}: {
  patient?: Patient | null;
  onClose: () => void;
}) {
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const [form, setForm] = useState<PatientCreate>({
    full_name: patient?.full_name ?? "",
    age: patient?.age ?? 0,
    gender: patient?.gender ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
  });

  const editing = Boolean(patient);
  const loading =
    createMutation.isPending || updateMutation.isPending;

  const updateField = (
    key: keyof PatientCreate,
    value: string | number
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.full_name.trim()) return;
    if (!form.age || form.age < 0) return;

    try {
      if (patient) {
        const payload: PatientUpdate = {
          full_name: form.full_name,
          age: form.age,
          gender: form.gender,
          phone: form.phone,
          email: form.email,
          address: form.address,
        };

        await updateMutation.mutateAsync({
          patientId: patient.id,
          patient: payload,
        });
      } else {
        await createMutation.mutateAsync(form);
      }

      onClose();
    } catch {
      // mutation error is already available from React Query
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-card patient-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">PATIENT MANAGEMENT</span>
            <h2>{editing ? "Edit Patient" : "Add Patient"}</h2>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="form-field form-field-wide">
              <span>Full Name</span>
              <input
                value={form.full_name}
                onChange={(e) =>
                  updateField("full_name", e.target.value)
                }
                placeholder="Enter patient name"
                required
              />
            </label>

            <label className="form-field">
              <span>Age</span>
              <input
                type="number"
                min="0"
                value={form.age || ""}
                onChange={(e) =>
                  updateField("age", Number(e.target.value))
                }
                placeholder="Age"
                required
              />
            </label>

            <label className="form-field">
              <span>Gender</span>
              <select
                value={form.gender}
                onChange={(e) =>
                  updateField("gender", e.target.value)
                }
                required
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="form-field">
              <span>Phone</span>
              <input
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", e.target.value)
                }
                placeholder="Phone number"
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                placeholder="Email address"
              />
            </label>

            <label className="form-field form-field-wide">
              <span>Address</span>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) =>
                  updateField("address", e.target.value)
                }
                placeholder="Patient address"
              />
            </label>
          </div>

          {(createMutation.isError || updateMutation.isError) && (
            <div className="form-error">
              Unable to save patient. Please check the backend
              and try again.
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editing
                ? "Save Changes"
                : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PatientsPage() {
  const { data: patients = [], isLoading, isError, refetch } =
    usePatients();

  const deleteMutation = useDeletePatient();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return patients;

    return patients.filter((patient) => {
      return [
        patient.full_name,
        patient.phone,
        patient.email,
        patient.gender,
        String(patient.id),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );
    });
  }, [patients, search]);

  const handleDelete = async (patient: Patient) => {
    const confirmed = window.confirm(
      `Delete patient "${patient.full_name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(patient.id);
    } catch {
      window.alert(
        "Unable to delete patient. Please try again."
      );
    }
  };

  return (
    <section className="clinical-page">
      <div className="clinical-page-header">
        <div>
          <div className="page-breadcrumb">
            Home / Patients
          </div>

          <h1>Patients</h1>

          <p>
            Patient roster, clinical details and follow-up
            planning
          </p>
        </div>

        <button
          type="button"
          className="button-primary"
          onClick={() => {
            setEditingPatient(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          Add Patient
        </button>
      </div>

      <div className="clinical-card">
        <div className="toolbar">
          <div className="search-input">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, patient ID, phone..."
            />
          </div>

          <div className="toolbar-meta">
            {filteredPatients.length} patient
            {filteredPatients.length !== 1 ? "s" : ""}
          </div>
        </div>

        {isLoading ? (
          <div className="table-loading">
            <div className="loading-spinner" />
            <span>Loading patient records...</span>
          </div>
        ) : isError ? (
          <div className="table-state">
            <div className="state-icon danger">
              <UserRound size={20} />
            </div>

            <h3>Unable to load patients</h3>

            <p>
              The frontend could not retrieve patient records
              from the FastAPI backend.
            </p>

            <button
              type="button"
              className="button-secondary"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="table-state">
            <div className="state-icon">
              <Search size={20} />
            </div>

            <h3>No patients found</h3>

            <p>
              No patient records match your current search.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Doctor ID</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="record-id">
                        PT-{String(patient.id).padStart(5, "0")}
                      </span>
                    </td>

                    <td>
                      <div className="record-person">
                        <div className="record-avatar">
                          {patient.full_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{patient.full_name}</strong>
                          <span>{patient.email || "—"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{patient.age}</td>
                    <td>
                      <span className="gender-badge">
                        {patient.gender || "—"}
                      </span>
                    </td>
                    <td>{patient.phone || "—"}</td>
                    <td>{patient.doctor_id ?? "—"}</td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-action"
                          title="View"
                          onClick={() => {
                            window.location.href =
                              `/patients/${patient.id}`;
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="table-action"
                          title="Edit"
                          onClick={() => {
                            setEditingPatient(patient);
                            setModalOpen(true);
                          }}
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          className="table-action danger"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                          onClick={() => handleDelete(patient)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <PatientModal
          patient={editingPatient}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}