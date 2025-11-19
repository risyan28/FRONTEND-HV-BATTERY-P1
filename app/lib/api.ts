import axios, { type AxiosInstance } from "axios";

/**
 * Mengembalikan base URL backend.
 * - Browser runtime: otomatis ambil hostname dari window
 * - Server (SSR / build): fallback ke localhost
 */
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  if (typeof window === "undefined") {
    // fallback saat SSR / server-side
    return "http://localhost:4001/api";
  }

  const { protocol, hostname } = window.location;
  const port = 4001;
  return `${protocol}//${hostname}:${port}/api`;
};

/**
 * Factory function untuk membuat instance Axios.
 * Dipanggil di browser runtime / event handler.
 */
export const createApi = (): AxiosInstance => {
  const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("[API Error]:", error.message);
      return Promise.reject(error);
    }
  );

  return api;
};

/**
 * Helper untuk mengecek koneksi backend
 */
export const checkBackendConnection = async () => {
  try {
    const api = createApi();
    const res = await api.get("/health");
    return { connected: true, data: res.data };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return { connected: false, error: error.message };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { connected: false, error: message };
  }
};
