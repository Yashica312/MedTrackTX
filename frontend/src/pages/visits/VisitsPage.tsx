import { useMemo, useState } from "react";
import {
  CalendarDays,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useDeleteVisit,
  useVisits,
} from "../../hooks/useVisits";

import {
  usePatients,
} from "../../hooks/usePatients";


export default function VisitsPage() {
  const navigate = useNavigate();

  const {
    data: visits = [],
    isLoading,
    isError,
    refetch,
  } = useVisits();

  const {
    data: patients = [],
  } = usePatients();

  const deleteMutation =
    useDeleteVisit();

  const [search, setSearch] =
    useState("");


  // ============================================================
  // PATIENT NAME MAP
  // ============================================================

  const patientMap = useMemo(() => {
    const map = new Map<number, string>();

    patients.forEach((patient) => {
      map.set(
        patient.id,
        patient.full_name
      );
    });

    return map;
  }, [patients]);


  // ============================================================
  // PATIENT-WISE VISIT NUMBERS
  //
  // Database visit.id remains GLOBAL.
  // Display number becomes:
  //
  // Patient 1 → V1, V2, V3
  // Patient 2 → V1, V2, V3
  //
  // Older visit date = lower visit number.
  // ============================================================

  const visitNumbers = useMemo(() => {
    const numbers =
      new Map<number, number>();

    const counters =
      new Map<number, number>();

    const chronologicalVisits =
      [...visits].sort(
        (a, b) =>
          new Date(
            a.visit_date
          ).getTime() -
          new Date(
            b.visit_date
          ).getTime()
      );

    chronologicalVisits.forEach(
      (visit) => {
        const currentCount =
          (counters.get(
            visit.patient_id
          ) || 0) + 1;

        counters.set(
          visit.patient_id,
          currentCount
        );

        numbers.set(
          visit.id,
          currentCount
        );
      }
    );

    return numbers;
  }, [visits]);


  // ============================================================
  // FILTER + SORT
  // ============================================================

  const filteredVisits = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const sorted =
      [...visits].sort(
        (a, b) =>
          new Date(
            b.visit_date
          ).getTime() -
          new Date(
            a.visit_date
          ).getTime()
      );

    if (!query) {
      return sorted;
    }

    return sorted.filter(
      (visit) => {
        const patientName =
          patientMap.get(
            visit.patient_id
          ) || "";

        return [
          patientName,
          visit.symptoms,
          visit.doctor_notes,
          visit.visit_date,
          String(
            visit.patient_id
          ),
          `V${visitNumbers.get(
            visit.id
          )}`,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(query)
          );
      }
    );
  }, [
    visits,
    patientMap,
    visitNumbers,
    search,
  ]);


  // ============================================================
  // DELETE VISIT
  // ============================================================

  const handleDelete = async (
    visitId: number
  ) => {
    const confirmed =
      window.confirm(
        "Delete this visit?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(
        visitId
      );
    } catch (error) {
      console.error(
        "Failed to delete visit:",
        error
      );

      window.alert(
        "Unable to delete visit."
      );
    }
  };


  // ============================================================
  // PAGE
  // ============================================================

  return (
    <section className="clinical-page">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="clinical-page-header">

        <div>

          <div className="page-breadcrumb">
            Home / Visits
          </div>

          <h1>
            Visits
          </h1>

          <p>
            Clinical visit history and
            patient follow-up records.
          </p>

        </div>


        <button
          type="button"
          className="button-primary"
          onClick={() =>
            navigate(
              "/visits/new"
            )
          }
        >

          <Plus size={16} />

          New Visit

        </button>

      </div>


      {/* ======================================================
          MAIN CARD
      ======================================================= */}

      <div className="clinical-card">

        {/* ====================================================
            TOOLBAR
        ===================================================== */}

        <div className="toolbar">

          <div className="search-input">

            <Search size={16} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search patient, visit, date, symptoms..."
            />

          </div>


          <div className="toolbar-meta">

            {filteredVisits.length}

            {" "}

            visit
            {filteredVisits.length !== 1
              ? "s"
              : ""}

          </div>

        </div>


        {/* ====================================================
            LOADING
        ===================================================== */}

        {isLoading && (

          <div className="table-loading">

            <div className="loading-spinner" />

            <span>
              Loading visits...
            </span>

          </div>

        )}


        {/* ====================================================
            ERROR
        ===================================================== */}

        {!isLoading &&
          isError && (

            <div className="table-state">

              <h3>
                Unable to load visits
              </h3>

              <p>
                Could not retrieve visit
                records from the backend.
              </p>

              <button
                type="button"
                className="button-secondary"
                onClick={() =>
                  refetch()
                }
              >
                Retry
              </button>

            </div>

          )}


        {/* ====================================================
            EMPTY
        ===================================================== */}

        {!isLoading &&
          !isError &&
          filteredVisits.length ===
            0 && (

            <div className="table-state">

              <div className="state-icon">

                <CalendarDays
                  size={20}
                />

              </div>

              <h3>
                {search
                  ? "No visits found"
                  : "No visits yet"}
              </h3>

              <p>
                {search
                  ? "No visit records match your search."
                  : "Create the first visit for one of your patients."}
              </p>

              {!search && (

                <button
                  type="button"
                  className="button-primary"
                  onClick={() =>
                    navigate(
                      "/visits/new"
                    )
                  }
                >

                  <Plus size={15} />

                  New Visit

                </button>

              )}

            </div>

          )}


        {/* ====================================================
            VISIT TABLE
        ===================================================== */}

        {!isLoading &&
          !isError &&
          filteredVisits.length >
            0 && (

            <div className="table-scroll">

              <table className="clinical-table">

                <thead>

                  <tr>

                    <th>
                      Visit
                    </th>

                    <th>
                      Patient
                    </th>

                    <th>
                      Visit Date
                    </th>

                    <th>
                      Symptoms
                    </th>

                    <th>
                      Doctor Notes
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredVisits.map(
                    (visit) => (

                      <tr
                        key={
                          visit.id
                        }
                      >

                        {/* =================================
                            PATIENT-WISE VISIT NUMBER
                            ================================= */}

                        <td>

                          <span
                            className="record-id"
                          >
                            V
                            {visitNumbers.get(
                              visit.id
                            )}
                          </span>

                        </td>


                        {/* =================================
                            PATIENT
                            ================================= */}

                        <td>

                          <strong>

                            {patientMap.get(
                              visit.patient_id
                            ) ||
                              `Patient #${visit.patient_id}`}

                          </strong>

                        </td>


                        {/* =================================
                            DATE
                            ================================= */}

                        <td>

                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "7px",
                            }}
                          >

                            <CalendarDays
                              size={15}
                            />

                            {visit.visit_date}

                          </div>

                        </td>


                        {/* =================================
                            SYMPTOMS
                            ================================= */}

                        <td>

                          {visit.symptoms ||
                            "—"}

                        </td>


                        {/* =================================
                            DOCTOR NOTES
                            ================================= */}

                        <td>

                          {visit.doctor_notes ||
                            "—"}

                        </td>


                        {/* =================================
                            ACTIONS
                            ================================= */}

                        <td>

                          <div
                            className="table-actions"
                          >

                            {/* VIEW */}

                            <button
                              type="button"
                              className="table-action"
                              title="View visit"
                              onClick={() =>
                                navigate(
                                  `/visits/${visit.id}`
                                )
                              }
                            >

                              <Eye
                                size={15}
                              />

                            </button>


                            {/* EDIT */}

                            <button
                              type="button"
                              className="table-action"
                              title="Edit visit"
                              onClick={() =>
                                navigate(
                                  `/visits/${visit.id}/edit`
                                )
                              }
                            >

                              <Edit3
                                size={15}
                              />

                            </button>


                            {/* DELETE */}

                            <button
                              type="button"
                              className="table-action danger"
                              title="Delete visit"
                              disabled={
                                deleteMutation.isPending
                              }
                              onClick={() =>
                                handleDelete(
                                  visit.id
                                )
                              }
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
  );
}