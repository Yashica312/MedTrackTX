import { apiClient } from "./client";


// ============================================================
// TYPES
// ============================================================

export interface AnalysisRequest {
  visit_id: number;
  current_image: File;
  previous_image?: File | null;
}


export interface AnalysisResponse {
  success: boolean;
  visit_id: number;
  current_filename?: string;
  previous_filename?: string | null;

  analysis?: {
    prediction?: {
      prediction?: string;
      class?: string;
      confidence?: number;
      [key: string]: unknown;
    };

    segmentation?: {
      mask_base64?: string;
    };

    gradcam?: {
      predicted_class?: string;
      overlay_base64?: string;
    };

    abcde?: {
      A_asymmetry?: number;
      B_border?: number;
      C_color?: number;
      D_diameter?: number;
      E_evolution?: number;
      overall_score?: number;
      [key: string]: unknown;
    };

    temporal?: {
      evolution_score?: number;
      growth_percentage?: number;
      risk_change?: string;
      comparison_image?: string;
      [key: string]: unknown;
    } | null;

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

  detail?: string;
}


// ============================================================
// COMPLETE AI ANALYSIS
// ============================================================

export async function analyzeLesion(
  data: AnalysisRequest
): Promise<AnalysisResponse> {

  const formData =
    new FormData();


  // ----------------------------------------------------------
  // Visit ID
  // ----------------------------------------------------------

  formData.append(
    "visit_id",
    String(data.visit_id)
  );


  // ----------------------------------------------------------
  // Current image
  // ----------------------------------------------------------

  formData.append(
    "current_image",
    data.current_image
  );


  // ----------------------------------------------------------
  // Previous image
  // ----------------------------------------------------------

  if (
    data.previous_image
  ) {

    formData.append(
      "previous_image",
      data.previous_image
    );

  }


  // ----------------------------------------------------------
  // POST
  // ----------------------------------------------------------

  const response =
    await apiClient.post<AnalysisResponse>(
      "/analysis/",
      formData
    );


  return response.data;
}