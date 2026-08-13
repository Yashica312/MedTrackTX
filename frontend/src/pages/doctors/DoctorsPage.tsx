import { useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2, X } from "lucide-react";

import {
  createDoctor,
  deleteDoctor,
  updateDoctor,
  type Doctor,
} from "../../api/doctors";
import { useDoctors } from "../../hooks/useDoctors";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DoctorForm {
  full_name: string;
  email: string;
}

const EMPTY_FORM: DoctorForm = {
  full_name: "",
  email: "",
};

export default function DoctorsPage() {
  const queryClient = useQueryClient();

  const {
    data: doctors = [],
    isLoading,
    isError,
    refetch,
  } = useDoctors();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] =
    useState<Doctor | null>(null);

  const [form, setForm] =
    useState<DoctorForm>(EMPTY_FORM);

  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctors"],
      });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: DoctorForm;
    }) => updateDoctor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctors"],
      });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctors"],
      });
    },
  });

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return doctors;

    return doctors.filter((doctor) =>
      [
        doctor.full_name,
        doctor.email,
        String(doctor.id),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [doctors, search]);

  function openAdd() {
    setEditingDoctor(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(doctor: Doctor) {
    setEditingDoctor(doctor);
    setForm({
      full_name: doctor.full_name,
      email: doctor.email ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingDoctor(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();
    setError("");

    if (!form.full_name.trim()) {
      setError("Doctor name is required.");
      return;
    }

    try {
      if (editingDoctor) {
        await updateMutation.mutateAsync({
          id: editingDoctor.id,
          data: form,
        });
      } else {
        await createMutation.mutateAsync(form);
      }
    } catch {
      setError(
        "Unable to save doctor. Please check the backend."
      );
    }
  }

  async function handleDelete(
    doctor: Doctor
  ) {
    const confirmed = window.confirm(
      `Delete doctor "${doctor.full_name}"?`
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(
        doctor.id
      );
    } catch {
      window.alert(
        "Unable to delete doctor."
      );
    }
  }

  if (isLoading) {
    return (
      <main className="page-container">
        <div className="page-loading">
          <div className="loading-spinner" />
          <p>Loading doctors...</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="page-container">
        <div className="page-error">
          <h2>Unable to load doctors</h2>
          <button
            className="button-primary"
            onClick={() => refetch()}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <section className="page-section">
        <div className="page-header">
          <div>
            <span className="eyebrow">
              CLINICAL MANAGEMENT
            </span>

            <h1>Doctors</h1>

            <p>
              Manage dermatology doctors and
              their patient assignments.
            </p>
          </div>

          <button
            className="button-primary"
            onClick={openAdd}
          >
            <Plus size={17} />
            Add Doctor
          </button>
        </div>

        <div className="card">
          <div className="table-toolbar">
            <div>
              <strong>
                {doctors.length}
              </strong>{" "}
              {doctors.length === 1
                ? "Doctor"
                : "Doctors"}
            </div>

            <div className="search-box">
              <Search size={17} />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search doctors..."
              />
            </div>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="empty-state">
              <h3>No doctors found</h3>
              <p>
                Add a doctor to start assigning
                patients.
              </p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Doctor ID</th>
                    <th>Doctor</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDoctors.map(
                    (doctor) => (
                      <tr key={doctor.id}>
                        <td>
                          <span className="record-id">
                            DR-
                            {String(
                              doctor.id
                            ).padStart(5, "0")}
                          </span>
                        </td>

                        <td>
                          <div className="record-person">
                            <div className="record-avatar">
                              {doctor.full_name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <strong>
                              Dr.{" "}
                              {doctor.full_name}
                            </strong>
                          </div>
                        </td>

                        <td>
                          {doctor.email ||
                            "—"}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="table-action"
                              onClick={() =>
                                openEdit(
                                  doctor
                                )
                              }
                              title="Edit"
                            >
                              <Edit3
                                size={15}
                              />
                            </button>

                            <button
                              className="table-action danger"
                              onClick={() =>
                                handleDelete(
                                  doctor
                                )
                              }
                              disabled={
                                deleteMutation.isPending
                              }
                              title="Delete"
                            >
                              <Trash2
                                size={15}
                              />
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
      </section>

      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={closeModal}
        >
          <div
            className="modal-card"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  DOCTOR MANAGEMENT
                </span>

                <h2>
                  {editingDoctor
                    ? "Edit Doctor"
                    : "Add Doctor"}
                </h2>
              </div>

              <button
                className="icon-button"
                onClick={closeModal}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <span>Full Name</span>

                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      full_name:
                        e.target.value,
                    })
                  }
                  placeholder="Doctor full name"
                  required
                />
              </div>

              <div className="form-field">
                <span>Email</span>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email:
                        e.target.value,
                    })
                  }
                  placeholder="doctor@example.com"
                />
              </div>

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button-primary"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  {createMutation.isPending ||
                  updateMutation.isPending
                    ? "Saving..."
                    : editingDoctor
                    ? "Save Changes"
                    : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}