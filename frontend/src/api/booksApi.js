import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constants/apiEndpoints';

// ─────────────────────────────────────────────────────────────────
// Pure HTTP layer — one function per endpoint, nothing else.
// Response interceptor has already unwrapped response.data,
// so every function here resolves to the raw API payload.
// ─────────────────────────────────────────────────────────────────
export const booksApi = {
  /** GET /books */
  getAll: () =>
    axiosInstance.get(ENDPOINTS.BOOKS),

  /** GET /books/:id */
  getById: (id) =>
    axiosInstance.get(ENDPOINTS.BOOK_BY_ID(id)),

  /** POST /books */
  create: (payload) =>
    axiosInstance.post(ENDPOINTS.BOOKS, payload),

  /** PUT /books/:id */
  update: (id, payload) =>
    axiosInstance.put(ENDPOINTS.BOOK_BY_ID(id), payload),

  /** DELETE /books/:id */
  remove: (id) =>
    axiosInstance.delete(ENDPOINTS.BOOK_BY_ID(id)),
};