import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../../api/client";

interface AnalysisResult {
  success?: boolean;
  visit_id?: number;
  current_filename?: string;
  previous_filename?: string | null;

  analysis?: {
    prediction?: {
      prediction?: string;
      class?: string;
      confidence?: number;
    };

    segmentation?: {
      mask_base64?: string;
    };

    gradcam?: {
      predicted_class?: string;
      overlay_base64?: string;
    };

    abcde?: {
      overall_score?: number;
      A_asymmetry?: number;
      B_border?: number;
      C_color?: number;
      D_diameter?: number;
    };

    temporal?: {
      previous_area?: number;
      current_area?: number;
      area_change_percent?: number;

      previous_diameter?: number;
      current_diameter?: number;
      diameter_change_percent?: number;

      ssim?: number;
      dice_coefficient?: number;
      iou?: number;

      evolution_score?: number;
      progression?: string;
    };

    risk_assessment?: {
      risk_score?: number;
      risk_level?: string;
    };

    database?: {
      image_id?: number;
      prediction_id?: number;
      abcde_id?: number;
      saved?: boolean;
    };
  };
}


export default function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const visitIdParam = searchParams.get("visit_id");

  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const [currentImage, setCurrentImage] =
    useState<File | null>(null);

  const [previousImage, setPreviousImage] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  const visitId = Number(visitIdParam);


  useEffect(() => {
    if (!visitIdParam || Number.isNaN(visitId)) {
      setError("Invalid visit ID.");
    }
  }, [visitIdParam, visitId]);


  async function handleAnalysis() {
    if (!visitId || visitId <= 0) {
      setError("Invalid visit ID.");
      return;
    }

    if (!currentImage) {
      setError("Please upload the current lesion image.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append(
        "current_image",
        currentImage
      );

      if (previousImage) {
        formData.append(
          "previous_image",
          previousImage
        );
      }

      const response =
        await apiClient.post<AnalysisResult>(
          `/analysis/?visit_id=${visitId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

      setResult(response.data);

      setSuccessMessage(
        "Complete lesion analysis completed successfully."
      );

    } catch (err: any) {
      console.error(
        "Analysis failed:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to perform lesion analysis."
      );

    } finally {
      setLoading(false);
    }
  }


  if (!visitIdParam || !visitId) {
    return (
      <section className="page-placeholder">

        <div className="page-heading">
          <span className="eyebrow">
            MEDTRACK-TX
          </span>

          <h1>Lesion Analysis</h1>
        </div>

        <div className="placeholder-card">
          <h2>Invalid Visit</h2>

          <p>
            Please open lesion analysis from a valid
            patient visit.
          </p>

          <button
            type="button"
            onClick={() => navigate("/visits")}
            style={{
              marginTop: "20px",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            Back to Visits
          </button>
        </div>

      </section>
    );
  }


  const analysis = result?.analysis;

  const prediction =
    analysis?.prediction;

  const temporal =
    analysis?.temporal;

  const abcde =
    analysis?.abcde;

  const risk =
    analysis?.risk_assessment;

  const gradcam =
    analysis?.gradcam;

  const segmentation =
    analysis?.segmentation;


  return (
    <section className="page-placeholder">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-heading">

        <span className="eyebrow">
          MEDTRACK-TX
        </span>

        <h1>Lesion Analysis</h1>

        <p>
          AI-powered skin lesion evolution analysis
          for Visit #{visitId}
        </p>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}


      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {successMessage && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px",
            borderRadius: "8px",
            background: "#dcfce7",
            color: "#166534",
          }}
        >
          {successMessage}
        </div>
      )}


      {/* =====================================================
          IMAGE UPLOAD
      ===================================================== */}

      <div className="placeholder-card">

        <h2>Dermoscopic Images</h2>

        <p>
          Upload the current lesion image and,
          if available, the previous visit image.
        </p>


        <div
          style={{
            display: "grid",
            gap: "20px",
            marginTop: "20px",
          }}
        >

          {/* Current */}

          <div>

            <label>
              <strong>
                Current Lesion Image *
              </strong>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCurrentImage(
                  e.target.files?.[0] || null
                )
              }
              style={{
                display: "block",
                marginTop: "8px",
              }}
            />

            {currentImage && (
              <p>
                Selected: {currentImage.name}
              </p>
            )}

          </div>


          {/* Previous */}

          <div>

            <label>
              <strong>
                Previous Visit Image
              </strong>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPreviousImage(
                  e.target.files?.[0] || null
                )
              }
              style={{
                display: "block",
                marginTop: "8px",
              }}
            />

            {previousImage && (
              <p>
                Selected: {previousImage.name}
              </p>
            )}

          </div>

        </div>


        <button
          type="button"
          onClick={handleAnalysis}
          disabled={loading}
          style={{
            marginTop: "25px",
            padding: "12px 22px",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Running AI Analysis..."
            : "Analyze Lesion"}
        </button>

      </div>


      {/* =====================================================
          RESULTS
      ===================================================== */}

      {result && analysis && (
        <div
          style={{
            display: "grid",
            gap: "20px",
            marginTop: "25px",
          }}
        >

          {/* =================================================
              PREDICTION
          ================================================= */}

          <div className="placeholder-card">

            <h2>
              AI Classification
            </h2>

            <p>
              <strong>Prediction:</strong>{" "}
              {prediction?.prediction ||
                prediction?.class ||
                "Unknown"}
            </p>

            <p>
              <strong>
                Confidence:
              </strong>{" "}
              {prediction?.confidence !==
              undefined
                ? `${(
                    prediction.confidence <= 1
                      ? prediction.confidence * 100
                      : prediction.confidence
                  ).toFixed(2)}%`
                : "N/A"}
            </p>

          </div>


          {/* =================================================
              RISK
          ================================================= */}

          <div className="placeholder-card">

            <h2>
              Risk Assessment
            </h2>

            <p>
              <strong>
                Risk Score:
              </strong>{" "}
              {risk?.risk_score ?? "N/A"}
            </p>

            <p>
              <strong>
                Risk Level:
              </strong>{" "}
              {risk?.risk_level || "N/A"}
            </p>

          </div>


          {/* =================================================
              ABCDE
          ================================================= */}

          <div className="placeholder-card">

            <h2>
              ABCDE Analysis
            </h2>

            <p>
              <strong>
                Overall Score:
              </strong>{" "}
              {abcde?.overall_score ?? "N/A"}
            </p>

            <p>
              <strong>
                Asymmetry:
              </strong>{" "}
              {abcde?.A_asymmetry ?? "N/A"}
            </p>

            <p>
              <strong>
                Border:
              </strong>{" "}
              {abcde?.B_border ?? "N/A"}
            </p>

            <p>
              <strong>
                Color:
              </strong>{" "}
              {abcde?.C_color ?? "N/A"}
            </p>

            <p>
              <strong>
                Diameter:
              </strong>{" "}
              {abcde?.D_diameter ?? "N/A"}
            </p>

          </div>


          {/* =================================================
              TEMPORAL
          ================================================= */}

          {temporal && (
            <div className="placeholder-card">

              <h2>
                Temporal Evolution
              </h2>

              <p>
                <strong>
                  Previous Area:
                </strong>{" "}
                {temporal.previous_area ?? "N/A"}
              </p>

              <p>
                <strong>
                  Current Area:
                </strong>{" "}
                {temporal.current_area ?? "N/A"}
              </p>

              <p>
                <strong>
                  Area Change:
                </strong>{" "}
                {temporal.area_change_percent ?? "N/A"}%
              </p>

              <p>
                <strong>
                  Previous Diameter:
                </strong>{" "}
                {temporal.previous_diameter ?? "N/A"}
              </p>

              <p>
                <strong>
                  Current Diameter:
                </strong>{" "}
                {temporal.current_diameter ?? "N/A"}
              </p>

              <p>
                <strong>
                  Diameter Change:
                </strong>{" "}
                {temporal.diameter_change_percent ?? "N/A"}%
              </p>

              <p>
                <strong>
                  SSIM:
                </strong>{" "}
                {temporal.ssim ?? "N/A"}
              </p>

              <p>
                <strong>
                  Dice:
                </strong>{" "}
                {temporal.dice_coefficient ?? "N/A"}
              </p>

              <p>
                <strong>
                  IoU:
                </strong>{" "}
                {temporal.iou ?? "N/A"}
              </p>

              <h3>
                {temporal.progression ||
                  "Stable"}
              </h3>

            </div>
          )}


          {/* =================================================
              SEGMENTATION
          ================================================= */}

          {segmentation?.mask_base64 && (
            <div className="placeholder-card">

              <h2>
                U-Net Segmentation
              </h2>

              <img
                src={`data:image/png;base64,${segmentation.mask_base64}`}
                alt="Lesion segmentation"
                style={{
                  maxWidth: "400px",
                  width: "100%",
                  borderRadius: "8px",
                }}
              />

            </div>
          )}


          {/* =================================================
              GRAD CAM
          ================================================= */}

          {gradcam?.overlay_base64 && (
            <div className="placeholder-card">

              <h2>
                Grad-CAM Explainability
              </h2>

              <p>
                <strong>
                  Predicted Class:
                </strong>{" "}
                {gradcam.predicted_class ||
                  "N/A"}
              </p>

              <img
                src={`data:image/png;base64,${gradcam.overlay_base64}`}
                alt="Grad-CAM visualization"
                style={{
                  maxWidth: "500px",
                  width: "100%",
                  borderRadius: "8px",
                }}
              />

            </div>
          )}


          {/* =================================================
              DATABASE
          ================================================= */}

          {analysis.database && (
            <div className="placeholder-card">

              <h2>
                Analysis Saved
              </h2>

              <p>
                Image ID:{" "}
                {analysis.database.image_id}
              </p>

              <p>
                Prediction ID:{" "}
                {analysis.database.prediction_id}
              </p>

              <p>
                ABCDE ID:{" "}
                {analysis.database.abcde_id}
              </p>

            </div>
          )}

        </div>
      )}

    </section>
  );
}