import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
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
