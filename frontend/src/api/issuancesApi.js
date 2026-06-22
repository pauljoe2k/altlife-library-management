import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constants/apiEndpoints';

// ─────────────────────────────────────────────────────────────────
// Pure HTTP layer for /issuances endpoints.
// ─────────────────────────────────────────────────────────────────
export const issuancesApi = {
  /** GET /issuances */
  getAll: () =>
    axiosInstance.get(ENDPOINTS.ISSUANCES),

  /** POST /issuances */
  create: (payload) =>
    axiosInstance.post(ENDPOINTS.ISSUANCES, payload),

  /** PUT /issuances/:id */
  update: (id, payload) =>
    axiosInstance.put(ENDPOINTS.ISSUANCE_BY_ID(id), payload),

  /** PUT /issuances/:id/return */
  returnBook: (id) =>
    axiosInstance.put(ENDPOINTS.RETURN_BOOK(id)),

  /** DELETE /issuances/:id */
  remove: (id) =>
    axiosInstance.delete(ENDPOINTS.ISSUANCE_BY_ID(id)),
};