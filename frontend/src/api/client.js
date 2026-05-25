import axios from "axios";

const API_BASES = [
  import.meta.env.VITE_API_URL,
  "http://127.0.0.1:8001/api",
  "http://localhost:8001/api",
  "http://localhost:8000/api",
  "http://127.0.0.1:8000/api"
].filter(Boolean);

export const api = axios.create({
  baseURL: API_BASES[0],
  timeout: 120000
});

async function requestWithFallback(callback) {
  let lastError;
  for (const baseURL of API_BASES) {
    try {
      api.defaults.baseURL = baseURL;
      const response = await callback();
      return response.data;
    } catch (error) {
      lastError = error;
      if (error.response) {
        throw error;
      }
    }
  }
  throw lastError;
}

export async function rankTextPayload(payload) {
  return requestWithFallback(() => api.post("/rank", payload));
}

export async function rankFiles(formData) {
  return requestWithFallback(() => api.post("/rank/files", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }));
}
