import type { Patient } from "../../api/patients";

interface PatientTableProps {
  patients: Patient[];
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export default function PatientTable({
  patients,
  onView,
  onEdit,
  onDelete,
}: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="table-empty">
        <div className="table-empty-icon">👤</div>
        <h3>No patients found</h3>
        <p>
          There are no patients matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Doctor ID</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>
                <div className="patient-cell">
                  <div className="patient-avatar">
                    {patient.full_name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="patient-name">
                      {patient.full_name}
                    </div>

                    <div className="patient-id">
                      ID #{patient.id}
                    </div>
                  </div>
                </div>
              </td>

              <td>{patient.age}</td>

              <td>
                <span className="gender-badge">
                  {patient.gender}
                </span>
              </td>

              <td>{patient.phone || "—"}</td>

              <td>{patient.email || "—"}</td>

              <td>
                {patient.doctor_id
                  ? `#${patient.doctor_id}`
                  : "—"}
              </td>

              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    className="table-action"
                    onClick={() =>
                      onView(patient)
                    }
                    title="View patient"
                  >
                    View
                  </button>

                  <button
                    type="button"
                    className="table-action"
                    onClick={() =>
                      onEdit(patient)
                    }
                    title="Edit patient"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="table-action table-action-danger"
                    onClick={() =>
                      onDelete(patient)
                    }
                    title="Delete patient"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}