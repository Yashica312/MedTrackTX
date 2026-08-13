import { apiClient } from "./client";

export interface LesionImage {
  id: number;
  visit_id: number;
  image_path: string;
  uploaded_at?: string;
}

export interface LesionImageUploadResponse {
  message: string;
  image_id: number;
  image_path: string;
}

export async function uploadLesionImage(
  visitId: number,
  file: File
): Promise<LesionImageUploadResponse> {
  const formData = new FormData();

  formData.append("visit_id", String(visitId));
  formData.append("image", file);

  const response =
    await apiClient.post<LesionImageUploadResponse>(
      "/lesion-images/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

  return response.data;
}

export async function fetchLesionImages(): Promise<
  LesionImage[]
> {
  const response =
    await apiClient.get<LesionImage[]>(
      "/lesion-images/"
    );

  return response.data;
}

export async function fetchLesionImageById(
  imageId: number
): Promise<LesionImage> {
  const response =
    await apiClient.get<LesionImage>(
      `/lesion-images/${imageId}`
    );

  return response.data;
}

export async function deleteLesionImage(
  imageId: number
): Promise<{ message: string }> {
  const response =
    await apiClient.delete<{ message: string }>(
      `/lesion-images/${imageId}`
    );

  return response.data;
}