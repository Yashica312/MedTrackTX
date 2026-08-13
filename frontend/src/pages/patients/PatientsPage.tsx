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

  const editing = Boolean(patient);

  const [form, setForm] = useState<PatientCreate>({
    full_name: patient?.full_name ?? "",
    age: patient?.age ?? 0,
    gender: patient?.gender ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
  });

  const loading =
    createMutation.isPending ||
    updateMutation.isPending;


  const updateField = (
    key: keyof PatientCreate,
    value: string | number
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };


  const submit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.full_name.trim()) {
      return;
    }

    if (!form.age || form.age < 0) {
      return;
    }

    if (!form.gender) {
      return;
    }

    if (!form.phone.trim()) {
      return;
    }


    try {

      if (patient) {

        const payload: PatientUpdate = {
          full_name: form.full_name,
          age: form.age,
          gender: form.gender,
          phone: form.phone,
          email: form.email || undefined,
        };

        await updateMutation.mutateAsync({
          patientId: patient.id,
          patient: payload,
        });

      } else {

        await createMutation.mutateAsync({
          full_name: form.full_name,
          age: form.age,
          gender: form.gender,
          phone: form.phone,
          email: form.email || undefined,
        });

      }

      onClose();

    } catch {
      // React Query mutation state already contains the error.
    }
  };


  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="modal-card patient-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="modal-header">

          <div>

            <span className="eyebrow">
              PATIENT MANAGEMENT
            </span>

            <h2>
              {editing
                ? "Edit Patient"
                : "Add Patient"}
            </h2>

          </div>


          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <X size={18} />
          </button>

        </div>


        {/* FORM */}

        <form onSubmit={submit}>

          <div className="form-grid">


            {/* FULL NAME */}

            <label className="form-field form-field-wide">

              <span>
                Full Name
              </span>

              <input
                value={form.full_name}
                onChange={(event) =>
                  updateField(
                    "full_name",
                    event.target.value
                  )
                }
                placeholder="Enter patient name"
                required
              />

            </label>


            {/* AGE */}

            <label className="form-field">

              <span>
                Age
              </span>

              <input
                type="number"
                min="0"
                value={form.age || ""}
                onChange={(event) =>
                  updateField(
                    "age",
                    Number(event.target.value)
                  )
                }
                placeholder="Age"
                required
              />

            </label>


            {/* GENDER */}

            <label className="form-field">

              <span>
                Gender
              </span>

              <select
                value={form.gender}
                onChange={(event) =>
                  updateField(
                    "gender",
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </label>


            {/* PHONE */}

            <label className="form-field">

              <span>
                Phone
              </span>

              <input
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="Phone number"
                required
              />

            </label>


            {/* EMAIL */}

            <label className="form-field">

              <span>
                Email
              </span>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="Email address"
              />

            </label>

          </div>


          {/* INFO */}

          <div className="patient-assignment-note">

            <UserRound size={16} />

            <span>
              This patient will be automatically
              assigned to the currently logged-in doctor.
            </span>

          </div>


          {/* ERROR */}

          {(createMutation.isError ||
            updateMutation.isError) && (

            <div className="form-error">

              Unable to save patient.
              Please check the backend
              and try again.

            </div>

          )}


          {/* FOOTER */}

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

  const {
    data: patients = [],
    isLoading,
    isError,
    refetch,
  } = usePatients();


  const deleteMutation =
    useDeletePatient();


  const [search, setSearch] =
    useState("");


  const [modalOpen, setModalOpen] =
    useState(false);


  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);


  // =========================================================
  // SEARCH
  // =========================================================

  const filteredPatients = useMemo(() => {

    const query =
      search.trim().toLowerCase();


    if (!query) {
      return patients;
    }


    return patients.filter(
      (patient) => {

        return [
          patient.full_name,
          patient.phone,
          patient.email,
          patient.gender,
          String(patient.id),
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );

      }
    );

  }, [patients, search]);


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    patient: Patient
  ) => {

    const confirmed =
      window.confirm(
        `Delete patient "${patient.full_name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await deleteMutation.mutateAsync(
        patient.id
      );

    } catch {

      window.alert(
        "Unable to delete patient. Please try again."
      );

    }

  };


  // =========================================================
  // ADD
  // =========================================================

  const handleAddPatient = () => {

    setEditingPatient(null);

    setModalOpen(true);

  };


  // =========================================================
  // EDIT
  // =========================================================

  const handleEditPatient = (
    patient: Patient
  ) => {

    setEditingPatient(patient);

    setModalOpen(true);

  };


  // =========================================================
  // VIEW
  // =========================================================

  const handleViewPatient = (
    patientId: number
  ) => {

    window.location.href =
      `/patients/${patientId}`;

  };


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <section className="clinical-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="clinical-page-header">

        <div>

          <div className="page-breadcrumb">
            Home / Patients
          </div>

          <h1>
            Patients
          </h1>

          <p>
            Patient roster, clinical details
            and follow-up planning
          </p>

        </div>


        <button
          type="button"
          className="button-primary"
          onClick={handleAddPatient}
        >

          <Plus size={16} />

          Add Patient

        </button>

      </div>


      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <div className="clinical-card">


        {/* TOOLBAR */}

        <div className="toolbar">

          <div className="search-input">

            <Search size={16} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, patient ID, phone..."
            />

          </div>


          <div className="toolbar-meta">

            {filteredPatients.length}

            {" "}

            patient
            {filteredPatients.length !== 1
              ? "s"
              : ""}

          </div>

        </div>


        {/* ===================================================
            LOADING
        ==================================================== */}

        {isLoading ? (

          <div className="table-loading">

            <div className="loading-spinner" />

            <span>
              Loading patient records...
            </span>

          </div>


        ) : isError ? (

          /* =================================================
             ERROR
          ================================================== */

          <div className="table-state">

            <div className="state-icon danger">

              <UserRound size={20} />

            </div>


            <h3>
              Unable to load patients
            </h3>


            <p>
              The frontend could not retrieve
              patient records from the FastAPI
              backend.
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

          /* =================================================
             EMPTY
          ================================================== */

          <div className="table-state">

            <div className="state-icon">

              <Search size={20} />

            </div>


            <h3>
              {search
                ? "No patients found"
                : "No patients yet"}
            </h3>


            <p>

              {search
                ? "No patient records match your current search."
                : "Add your first patient to begin clinical monitoring."}

            </p>


            {!search && (

              <button
                type="button"
                className="button-primary"
                onClick={handleAddPatient}
              >

                <Plus size={15} />

                Add Patient

              </button>

            )}

          </div>


        ) : (

          /* =================================================
             TABLE
          ================================================== */

          <div className="table-scroll">

            <table className="clinical-table">

              <thead>

                <tr>

                  <th>
                    Patient ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Age
                  </th>

                  <th>
                    Gender
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredPatients.map(
                  (patient) => (

                    <tr
                      key={patient.id}
                    >


                      {/* PATIENT ID */}

                      <td>

                        <span className="record-id">

                          PT-
                          {String(
                            patient.id
                          ).padStart(
                            5,
                            "0"
                          )}

                        </span>

                      </td>


                      {/* NAME */}

                      <td>

                        <div className="record-person">

                          <div className="record-avatar">

                            {patient.full_name
                              .charAt(0)
                              .toUpperCase()}

                          </div>


                          <div>

                            <strong>
                              {patient.full_name}
                            </strong>

                            <span>
                              {patient.email ||
                                "No email provided"}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* AGE */}

                      <td>
                        {patient.age}
                      </td>


                      {/* GENDER */}

                      <td>

                        <span className="gender-badge">

                          {patient.gender ||
                            "—"}

                        </span>

                      </td>


                      {/* PHONE */}

                      <td>
                        {patient.phone ||
                          "—"}
                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="table-actions">


                          {/* VIEW */}

                          <button
                            type="button"
                            className="table-action"
                            title="View patient"
                            onClick={() =>
                              handleViewPatient(
                                patient.id
                              )
                            }
                          >

                            <Eye size={15} />

                          </button>


                          {/* EDIT */}

                          <button
                            type="button"
                            className="table-action"
                            title="Edit patient"
                            onClick={() =>
                              handleEditPatient(
                                patient
                              )
                            }
                          >

                            <Edit3 size={15} />

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            className="table-action danger"
                            title="Delete patient"
                            disabled={
                              deleteMutation.isPending
                            }
                            onClick={() =>
                              handleDelete(
                                patient
                              )
                            }
                          >

                            <Trash2 size={15} />

                          </button>


                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          MODAL
      ====================================================== */}

      {modalOpen && (

        <PatientModal
          patient={
            editingPatient
          }
          onClose={() =>
            setModalOpen(false)
          }
        />

      )}

    </section>
  );
}