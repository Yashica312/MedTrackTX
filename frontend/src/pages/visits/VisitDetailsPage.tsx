import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchVisitById,
  fetchVisits,
  type Visit,
} from "../../api/visits";

import {
  fetchPatients,
  type Patient,
} from "../../api/patients";

import {
  fetchLesionImages,
  type LesionImage,
} from "../../api/lesionImages";


// ============================================================
// BACKEND URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";


// ============================================================
// PAGE
// ============================================================

export default function VisitDetailsPage() {

  const navigate = useNavigate();

  const { visitId } = useParams<{
    visitId: string;
  }>();

  const numericVisitId =
    Number(visitId);


  // ==========================================================
  // STATE
  // ==========================================================

  const [visit, setVisit] =
    useState<Visit | null>(null);

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [visits, setVisits] =
    useState<Visit[]>([]);

  const [lesionImages, setLesionImages] =
    useState<LesionImage[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [imageLoading, setImageLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [imageError, setImageError] =
    useState("");

  const [patientVisitNumber, setPatientVisitNumber] =
    useState<number | null>(null);


  // ==========================================================
  // LOAD VISIT + PATIENTS + ALL VISITS
  // ==========================================================

  useEffect(() => {

    async function loadData() {

      try {

        setLoading(true);
        setError("");

        if (
          !numericVisitId ||
          Number.isNaN(numericVisitId)
        ) {
          throw new Error(
            "Invalid visit ID"
          );
        }


        // ------------------------------------------------------
        // CURRENT VISIT
        // ------------------------------------------------------

        const currentVisit =
          await fetchVisitById(
            numericVisitId
          );

        setVisit(
          currentVisit
        );


        // ------------------------------------------------------
        // PATIENTS
        // ------------------------------------------------------

        const patientList =
          await fetchPatients();

        setPatients(
          patientList
        );


        // ------------------------------------------------------
        // ALL VISITS
        // Used only to calculate V1/V2/V3
        // ------------------------------------------------------

        const allVisits =
          await fetchVisits();

        setVisits(
          allVisits
        );


        // ------------------------------------------------------
        // PATIENT-WISE VISIT NUMBER
        // ------------------------------------------------------

        const patientVisits =
          allVisits
            .filter(
              (item) =>
                item.patient_id ===
                currentVisit.patient_id
            )
            .sort(
              (a, b) =>
                new Date(
                  a.visit_date
                ).getTime() -
                new Date(
                  b.visit_date
                ).getTime()
            );


        const index =
          patientVisits.findIndex(
            (item) =>
              item.id ===
              currentVisit.id
          );


        if (index >= 0) {

          setPatientVisitNumber(
            index + 1
          );

        }

      } catch (err) {

        console.error(
          "Failed to load visit:",
          err
        );

        setError(
          "Unable to load visit details."
        );

      } finally {

        setLoading(false);

      }

    }


    loadData();

  }, [numericVisitId]);


  // ==========================================================
  // LOAD LESION IMAGES
  // ==========================================================

  useEffect(() => {

    async function loadImages() {

      if (!visit) {
        return;
      }

      try {

        setImageLoading(true);
        setImageError("");

        const allImages =
          await fetchLesionImages();


        const currentVisitImages =
          allImages.filter(
            (image) =>
              image.visit_id ===
              visit.id
          );


        setLesionImages(
          currentVisitImages
        );

      } catch (err) {

        console.error(
          "Failed to load lesion images:",
          err
        );

        setImageError(
          "Unable to load lesion images."
        );

      } finally {

        setImageLoading(false);

      }

    }


    loadImages();

  }, [visit]);


  // ==========================================================
  // PATIENT
  // ==========================================================

  const patient =
    useMemo(() => {

      if (!visit) {
        return null;
      }

      return (
        patients.find(
          (item) =>
            item.id ===
            visit.patient_id
        ) || null
      );

    }, [
      patients,
      visit,
    ]);


  // ==========================================================
  // IMAGE URL
  // ==========================================================

  function getImageUrl(
    imagePath: string
  ) {

    if (
      imagePath.startsWith(
        "http://"
      ) ||
      imagePath.startsWith(
        "https://"
      )
    ) {
      return imagePath;
    }


    const normalized =
      imagePath.replace(
        /\\/g,
        "/"
      );


    // Example backend path:
    //
    // app/uploads/abc.jpg
    //
    // We only need:
    //
    // abc.jpg

    const filename =
      normalized
        .split("/")
        .pop();


    if (!filename) {
      return "";
    }


    return `${API_BASE_URL}/uploads/${filename}`;

  }


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (

      <section className="clinical-page">

        <div className="table-loading">

          <div className="loading-spinner" />

          <span>
            Loading visit details...
          </span>

        </div>

      </section>

    );

  }


  // ==========================================================
  // ERROR SCREEN
  // ==========================================================

  if (error || !visit) {

    return (

      <section className="clinical-page">

        <div className="table-state">

          <h3>
            Visit not found
          </h3>

          <p>
            {error ||
              "The requested visit could not be found."}
          </p>

          <button
            type="button"
            className="button-secondary"
            onClick={() =>
              navigate(
                "/visits"
              )
            }
          >

            <ArrowLeft
              size={16}
            />

            Back to Visits

          </button>

        </div>

      </section>

    );

  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <section className="clinical-page">


      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="clinical-page-header">

        <div>

          <div className="page-breadcrumb">

            Home / Visits /{" "}
            {patientVisitNumber
              ? `V${patientVisitNumber}`
              : "Visit Details"}

          </div>


          <h1>
            Visit Details
          </h1>


          <p>

            Clinical record for{" "}

            <strong>
              {patient?.full_name ||
                `Patient #${visit.patient_id}`}
            </strong>

          </p>

        </div>


        {/* HEADER ACTIONS */}

        <div
          style={{
            display:
              "flex",
            gap:
              "10px",
          }}
        >

          <button
            type="button"
            className="button-secondary"
            onClick={() =>
              navigate(
                "/visits"
              )
            }
          >

            <ArrowLeft
              size={16}
            />

            Back

          </button>


          <button
            type="button"
            className="button-primary"
            onClick={() =>
              navigate(
                `/visits/${visit.id}/edit`
              )
            }
          >

            <Edit3
              size={16}
            />

            Edit Visit

          </button>

        </div>

      </div>


      {/* ======================================================
          VISIT INFORMATION
      ======================================================= */}

      <div className="clinical-card">

        <div
          style={{
            padding:
              "24px",
          }}
        >

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap:
                "24px",
            }}
          >


            {/* PATIENT */}

            <div className="form-field">

              <label>
                Patient
              </label>

              <strong>
                {patient?.full_name ||
                  `Patient #${visit.patient_id}`}
              </strong>

            </div>


            {/* PATIENT-WISE VISIT */}

            <div className="form-field">

              <label>
                Visit
              </label>

              <strong>

                {patientVisitNumber
                  ? `V${patientVisitNumber}`
                  : "V—"}

              </strong>

            </div>


            {/* DATE */}

            <div className="form-field">

              <label>
                Visit Date
              </label>

              <strong
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "8px",
                }}
              >

                <CalendarDays
                  size={16}
                />

                {visit.visit_date}

              </strong>

            </div>


            {/* INTERNAL DATABASE ID */}

            <div className="form-field">

              <label>
                Record ID
              </label>

              <strong>

                VT-
                {String(
                  visit.id
                ).padStart(
                  5,
                  "0"
                )}

              </strong>

            </div>


            {/* SYMPTOMS */}

            <div
              className="form-field"
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >

              <label>
                Symptoms
              </label>

              <div>

                {visit.symptoms ||
                  "No symptoms recorded."}

              </div>

            </div>


            {/* DOCTOR NOTES */}

            <div
              className="form-field"
              style={{
                gridColumn:
                  "1 / -1",
              }}
            >

              <label>
                Doctor Notes
              </label>

              <div>

                {visit.doctor_notes ||
                  "No doctor notes recorded."}

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          LESION IMAGE
      ======================================================= */}

      <div
        className="clinical-card"
        style={{
          marginTop:
            "24px",
        }}
      >

        <div
          style={{
            padding:
              "24px",
          }}
        >


          {/* IMAGE HEADER */}

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              marginBottom:
                "20px",
            }}
          >

            <div>

              <h2
                style={{
                  margin:
                    "0 0 6px",
                }}
              >

                Dermoscopic Lesion Image

              </h2>

              <p
                style={{
                  margin:
                    "0",
                  opacity:
                    0.7,
                  fontSize:
                    "14px",
                }}
              >

                Image captured during{" "}

                {patientVisitNumber
                  ? `V${patientVisitNumber}`
                  : "this visit"}

              </p>

            </div>


            <button
              type="button"
              className="button-secondary"
              onClick={async () => {

                try {

                  setImageLoading(
                    true
                  );

                  setImageError(
                    ""
                  );

                  const allImages =
                    await fetchLesionImages();

                  const currentImages =
                    allImages.filter(
                      (image) =>
                        image.visit_id ===
                        visit.id
                    );

                  setLesionImages(
                    currentImages
                  );

                } catch (err) {

                  console.error(
                    err
                  );

                  setImageError(
                    "Unable to refresh images."
                  );

                } finally {

                  setImageLoading(
                    false
                  );

                }

              }}
              disabled={
                imageLoading
              }
            >

              <RefreshCw
                size={15}
              />

              Refresh

            </button>

          </div>


          {/* IMAGE LOADING */}

          {imageLoading && (

            <div className="table-loading">

              <div className="loading-spinner" />

              <span>
                Loading lesion image...
              </span>

            </div>

          )}


          {/* IMAGE ERROR */}

          {!imageLoading &&
            imageError && (

              <div className="table-state">

                <ImageIcon
                  size={30}
                />

                <h3>
                  Unable to load lesion image
                </h3>

                <p>
                  {imageError}
                </p>

              </div>

            )}


          {/* NO IMAGE */}

          {!imageLoading &&
            !imageError &&
            lesionImages.length ===
              0 && (

              <div className="table-state">

                <div
                  style={{
                    fontSize:
                      "40px",
                  }}
                >
                  📷
                </div>

                <h3>
                  No lesion image uploaded
                </h3>

                <p>
                  No dermoscopic image is
                  associated with this visit.
                </p>

              </div>

            )}


          {/* ==================================================
              IMAGE GRID
          =================================================== */}

          {!imageLoading &&
            !imageError &&
            lesionImages.length >
              0 && (

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(280px, 1fr))",
                  gap:
                    "20px",
                }}
              >

                {lesionImages.map(
                  (image) => (

                    <div
                      key={
                        image.id
                      }
                      style={{
                        border:
                          "1px solid #e4e7ec",
                        borderRadius:
                          "12px",
                        overflow:
                          "hidden",
                        background:
                          "#fff",
                      }}
                    >

                      {/* IMAGE */}

                      <div
                        style={{
                          width:
                            "100%",
                          height:
                            "320px",
                          background:
                            "#f7f8fa",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >

                        <img
                          src={
                            getImageUrl(
                              image.image_path
                            )
                          }
                          alt="Dermoscopic lesion"
                          style={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "contain",
                          }}
                        />

                      </div>


                      {/* IMAGE DETAILS */}

                      <div
                        style={{
                          padding:
                            "14px",
                        }}
                      >

                        <strong>
                          Lesion Image
                        </strong>


                        <div
                          style={{
                            marginTop:
                              "5px",
                            fontSize:
                              "13px",
                            opacity:
                              0.7,
                          }}
                        >

                          Image ID:{" "}
                          {image.id}

                        </div>


                        {image.uploaded_at && (

                          <div
                            style={{
                              marginTop:
                                "3px",
                              fontSize:
                                "13px",
                              opacity:
                                0.7,
                            }}
                          >

                            Uploaded:{" "}

                            {new Date(
                              image.uploaded_at
                            ).toLocaleString()}

                          </div>

                        )}

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

        </div>

      </div>


      {/* ======================================================
          ANALYSIS BUTTON
      ======================================================= */}

      {lesionImages.length >
        0 && (

        <div
          className="clinical-card"
          style={{
            marginTop:
              "24px",
          }}
        >

          <div
            style={{
              padding:
                "24px",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap:
                "20px",
            }}
          >

            <div>

              <h2
                style={{
                  margin:
                    "0 0 6px",
                }}
              >

                Ready for Lesion Analysis?

              </h2>

              <p
                style={{
                  margin:
                    "0",
                    opacity:
                    0.7,
                }}
              >

                Run AI-powered lesion
                analysis including
                segmentation, ABCDE
                assessment and
                explainability.

              </p>

            </div>


            <button
              type="button"
              className="button-primary"
              onClick={() =>
                navigate(
                  `/analysis?visit_id=${visit.id}`
                )
              }
            >

              Analyze Lesion

            </button>

          </div>

        </div>

      )}

    </section>

  );
}