import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constants/apiEndpoints';

// ─────────────────────────────────────────────────────────────────
// Pure HTTP layer for /members endpoints.
// ─────────────────────────────────────────────────────────────────
export const membersApi = {
  /** GET /members */
  getAll: () =>
    axiosInstance.get(ENDPOINTS.MEMBERS),

  /** GET /members/:id */
  getById: (id) =>
    axiosInstance.get(ENDPOINTS.MEMBER_BY_ID(id)),

  /** POST /members */
  create: (payload) =>
    axiosInstance.post(ENDPOINTS.MEMBERS, payload),

  /** PUT /members/:id */
  update: (id, payload) =>
    axiosInstance.put(ENDPOINTS.MEMBER_BY_ID(id), payload),

  /** DELETE /members/:id */
  remove: (id) =>
    axiosInstance.delete(ENDPOINTS.MEMBER_BY_ID(id)),
};