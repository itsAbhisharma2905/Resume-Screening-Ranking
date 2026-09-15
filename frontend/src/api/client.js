import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 120000
});

export async function rankTextPayload(payload) {
  const { data } = await api.post("/rank", payload);
  return data;
}

export async function rankFiles(formData) {
  const { data } = await api.post("/rank/files", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}
