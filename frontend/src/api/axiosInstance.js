import axios from 'axios';

// ─────────────────────────────────────────────────────────────────
// Single Axios instance shared across every API module.
// Base URL is injected from the .env file at build time.
// ─────────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 s — fail fast rather than hang
});

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────
// Slot reserved for auth token injection.
// When a /auth endpoint is added to the backend, uncomment the
// token lines — no other file needs to change.
axiosInstance.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(normaliseError(error))
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────
// Unwraps Axios envelope so callers receive `response.data` directly.
// Normalises every failure into a consistent { message, status, data }
// shape so services never need to inspect raw Axios errors.
axiosInstance.interceptors.response.use(
  (response) => response.data,          // ← unwrap: callers get data, not response
  (error) => Promise.reject(normaliseError(error))
);

// ── ERROR NORMALISER ──────────────────────────────────────────────
// Converts any Axios error (network, timeout, 4xx, 5xx) into a
// plain object that is safe to log, display, or inspect.
function normaliseError(error) {
  // Server replied with a non-2xx status
  if (error.response) {
    return {
      message: error.response.data?.message
        || error.response.data?.error
        || `Request failed with status ${error.response.status}`,
      status: error.response.status,
      data:   error.response.data ?? null,
    };
  }

  // Request was made but no response arrived (network / timeout)
  if (error.request) {
    return {
      message: 'No response from server. Check your network connection.',
      status:  null,
      data:    null,
    };
  }

  // Something went wrong while building the request
  return {
    message: error.message || 'An unexpected error occurred.',
    status:  null,
    data:    null,
  };
}

export default axiosInstance;