import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchPatients,
  type Patient,
} from "../../api/patients";

import {
  createVisit,
} from "../../api/visits";

import {
  uploadLesionImage,
} from "../../api/lesionImages";


export default function NewVisitPage() {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [patientId, setPatientId] =
    useState("");

  const [visitDate, setVisitDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [symptoms, setSymptoms] =
    useState("");

  const [doctorNotes, setDoctorNotes] =
    useState("");

  const [lesionImage, setLesionImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [loadingPatients, setLoadingPatients] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  // ============================================================
  // LOAD PATIENTS
  // ============================================================

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoadingPatients(true);
        setError("");

        const data =
          await fetchPatients();

        setPatients(data);

        if (data.length > 0) {
          setPatientId(
            String(data[0].id)
          );
        }

      } catch (err) {
        console.error(
          "Failed to load patients:",
          err
        );

        setError(
          "Unable to load patients. Please try again."
        );

      } finally {
        setLoadingPatients(false);
      }
    }

    loadPatients();
  }, []);


  // ============================================================
  // IMAGE SELECTION
  // ============================================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // Check image type
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      return;
    }

    // Maximum 10 MB
    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be less than 10 MB."
      );

      return;
    }

    setError("");

    setLesionImage(file);

    // Remove old preview
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    // Create new preview
    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(
      previewUrl
    );
  };


  // ============================================================
  // REMOVE IMAGE
  // ============================================================

  const handleRemoveImage = () => {

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setLesionImage(null);

    setImagePreview(null);
  };


  // ============================================================
  // CREATE VISIT + UPLOAD IMAGE
  // ============================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    setError("");


    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!patientId) {
      setError(
        "Please select a patient."
      );

      return;
    }

    if (!visitDate) {
      setError(
        "Please select a visit date."
      );

      return;
    }


    try {

      setSubmitting(true);


      // ========================================================
      // STEP 1
      // CREATE VISIT
      // ========================================================

      const createdVisit =
        await createVisit({

          patient_id:
            Number(patientId),

          visit_date:
            visitDate,

          symptoms:
            symptoms.trim() ||
            undefined,

          doctor_notes:
            doctorNotes.trim() ||
            undefined,

        });


      console.log(
        "Visit created:",
        createdVisit
      );


      // ========================================================
      // STEP 2
      // UPLOAD LESION IMAGE
      // ========================================================

      if (lesionImage) {

        const uploadResult =
          await uploadLesionImage(
            createdVisit.id,
            lesionImage
          );

        console.log(
          "Lesion image uploaded:",
          uploadResult
        );
      }


      // ========================================================
      // STEP 3
      // GO TO VISIT DETAILS
      // ========================================================

      navigate(
        `/visits/${createdVisit.id}`
      );


    } catch (err: any) {

      console.error(
        "Failed to create visit:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to create visit.";

      setError(message);


    } finally {

      setSubmitting(false);

    }
  };


  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    navigate("/visits");
  };


  // ============================================================
  // UI
  // ============================================================

  return (

    <section className="clinical-page">


      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="clinical-page-header">

        <div>

          <div className="page-breadcrumb">
            Home / Visits / New Visit
          </div>

          <h1>
            New Visit
          </h1>

          <p>
            Record a new clinical visit
            and upload the dermoscopic
            lesion image.
          </p>

        </div>

      </div>


      {/* ======================================================
          FORM CARD
      ======================================================= */}

      <div className="clinical-card">

        <form
          onSubmit={handleSubmit}
          style={{
            padding: "24px",
            maxWidth: "800px",
          }}
        >


          {/* ==================================================
              ERROR
          =================================================== */}

          {error && (

            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor:
                  "#fff1f2",
                color:
                  "#b42318",
                border:
                  "1px solid #fecdd3",
              }}
            >

              {error}

            </div>

          )}


          {/* ==================================================
              PATIENT
          =================================================== */}

          <div
            className="form-field"
            style={{
              marginBottom: "20px",
            }}
          >

            <label htmlFor="patient">
              Patient
            </label>

            <select
              id="patient"
              value={patientId}
              onChange={(event) =>
                setPatientId(
                  event.target.value
                )
              }
              disabled={
                loadingPatients ||
                submitting
              }
              required
            >

              <option value="">

                {loadingPatients
                  ? "Loading patients..."
                  : "Select patient"}

              </option>


              {patients.map(
                (patient) => (

                  <option
                    key={patient.id}
                    value={patient.id}
                  >

                    {patient.full_name}

                    {" — PT-"}

                    {String(
                      patient.id
                    ).padStart(
                      5,
                      "0"
                    )}

                  </option>

                )
              )}

            </select>

          </div>


          {/* ==================================================
              VISIT DATE
          =================================================== */}

          <div
            className="form-field"
            style={{
              marginBottom: "20px",
            }}
          >

            <label htmlFor="visit-date">
              Visit Date
            </label>

            <input
              id="visit-date"
              type="date"
              value={visitDate}
              onChange={(event) =>
                setVisitDate(
                  event.target.value
                )
              }
              disabled={submitting}
              required
            />

          </div>


          {/* ==================================================
              SYMPTOMS
          =================================================== */}

          <div
            className="form-field"
            style={{
              marginBottom: "20px",
            }}
          >

            <label htmlFor="symptoms">
              Symptoms
            </label>

            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(event) =>
                setSymptoms(
                  event.target.value
                )
              }
              placeholder="Describe the symptoms reported by the patient..."
              rows={5}
              disabled={submitting}
            />

          </div>


          {/* ==================================================
              DOCTOR NOTES
          =================================================== */}

          <div
            className="form-field"
            style={{
              marginBottom: "24px",
            }}
          >

            <label htmlFor="doctor-notes">
              Doctor Notes
            </label>

            <textarea
              id="doctor-notes"
              value={doctorNotes}
              onChange={(event) =>
                setDoctorNotes(
                  event.target.value
                )
              }
              placeholder="Enter clinical observations and examination notes..."
              rows={5}
              disabled={submitting}
            />

          </div>


          {/* ==================================================
              LESION IMAGE UPLOAD
          =================================================== */}

          <div
            className="form-field"
            style={{
              marginBottom: "28px",
            }}
          >

            <label>
              Dermoscopic Lesion Image
            </label>

            <p
              style={{
                marginTop: "4px",
                marginBottom: "12px",
                fontSize: "13px",
                opacity: 0.7,
              }}
            >
              Upload the dermoscopic image
              captured during this visit.
            </p>


            {/* =================================================
                NO IMAGE SELECTED
            ================================================== */}

            {!lesionImage && (

              <div
                style={{
                  border:
                    "2px dashed #d0d5dd",
                  borderRadius: "12px",
                  padding: "36px 24px",
                  textAlign: "center",
                }}
              >

                <div
                  style={{
                    fontSize: "36px",
                    marginBottom: "10px",
                  }}
                >
                  📷
                </div>


                <h3
                  style={{
                    margin:
                      "0 0 6px",
                  }}
                >
                  Upload Dermoscopic Image
                </h3>


                <p
                  style={{
                    margin:
                      "0 0 18px",
                    fontSize: "13px",
                    opacity: 0.7,
                  }}
                >
                  JPG, JPEG or PNG
                  {" • "}
                  Maximum 10 MB
                </p>


                <label
                  htmlFor="lesion-image"
                  className="button-secondary"
                  style={{
                    display:
                      "inline-block",
                    cursor:
                      "pointer",
                  }}
                >
                  Choose Image
                </label>


                <input
                  id="lesion-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={
                    handleImageChange
                  }
                  disabled={submitting}
                  hidden
                />

              </div>

            )}


            {/* =================================================
                IMAGE SELECTED
            ================================================== */}

            {lesionImage && (

              <div
                style={{
                  border:
                    "1px solid #d0d5dd",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >

                {/* IMAGE PREVIEW */}

                {imagePreview && (

                  <img
                    src={imagePreview}
                    alt="Selected lesion"
                    style={{
                      width:
                        "100%",
                      maxHeight:
                        "320px",
                      objectFit:
                        "contain",
                      borderRadius:
                        "8px",
                      marginBottom:
                        "14px",
                    }}
                  />

                )}


                {/* FILE INFO */}

                <div
                  style={{
                    marginBottom:
                      "14px",
                  }}
                >

                  <strong>
                    {lesionImage.name}
                  </strong>

                  <div
                    style={{
                      fontSize:
                        "13px",
                      opacity:
                        0.7,
                      marginTop:
                        "4px",
                    }}
                  >

                    {(
                      lesionImage.size /
                      1024 /
                      1024
                    ).toFixed(2)}

                    {" MB"}

                  </div>

                </div>


                {/* IMAGE ACTIONS */}

                <div
                  style={{
                    display:
                      "flex",
                    gap:
                      "10px",
                  }}
                >

                  <label
                    htmlFor="change-lesion-image"
                    className="button-secondary"
                    style={{
                      cursor:
                        "pointer",
                    }}
                  >
                    Change Image
                  </label>


                  <input
                    id="change-lesion-image"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={
                      handleImageChange
                    }
                    hidden
                  />


                  <button
                    type="button"
                    className="button-secondary"
                    onClick={
                      handleRemoveImage
                    }
                    disabled={
                      submitting
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            )}

          </div>


          {/* ==================================================
              ACTION BUTTONS
          =================================================== */}

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "flex-end",
              gap:
                "12px",
              paddingTop:
                "8px",
            }}
          >

            <button
              type="button"
              className="button-secondary"
              onClick={
                handleCancel
              }
              disabled={
                submitting
              }
            >
              Cancel
            </button>


            <button
              type="submit"
              className="button-primary"
              disabled={
                submitting ||
                loadingPatients ||
                !patientId
              }
            >

              {submitting
                ? "Creating Visit..."
                : lesionImage
                ? "Create Visit & Upload Image"
                : "Create Visit"}

            </button>

          </div>

        </form>

      </div>

    </section>
  );
}