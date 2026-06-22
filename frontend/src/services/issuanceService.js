import { issuancesApi } from '../api/issuancesApi';

async function safe(apiCall) {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Normalise backend response into a plain Issuance[].
 * Handles: []  |  { issuances: [] }  |  { data: [] }  |  null/undefined
 */
function normaliseIssuanceList(raw) {
  if (Array.isArray(raw))              return raw;
  if (Array.isArray(raw?.issuances))   return raw.issuances;
  if (Array.isArray(raw?.data))        return raw.data;
  return [];
}

function sanitiseIssuancePayload(raw) {
  return {
    memberId: raw.memberId ? Number(raw.memberId) : undefined,
    bookId:   raw.bookId   ? Number(raw.bookId)   : undefined,
    dueDate:  raw.dueDate?.trim() ?? '',
  };
}

export const issuanceService = {
  fetchAll: async () => {
    const result = await safe(() => issuancesApi.getAll());
    if (result.error) return result;
    return { data: normaliseIssuanceList(result.data), error: null };
  },

  issue: (formData) => {
    const payload = sanitiseIssuancePayload(formData);
    return safe(() => issuancesApi.create(payload));
  },

  update: (id, formData) => {
    const payload = sanitiseIssuancePayload(formData);
    return safe(() => issuancesApi.update(id, payload));
  },

  returnBook: (id) =>
    safe(() => issuancesApi.returnBook(id)),

  remove: (id) =>
    safe(() => issuancesApi.remove(id)),

  // ── Pure domain helpers (no API calls) ──────────────────────

  /**
   * An issuance is overdue when status is still "Issued"
   * and the dueDate has passed.
   */
  isOverdue: (issuance) => {
    if (issuance.status === 'Returned') return false;
    return new Date(issuance.dueDate) < new Date();
  },

  getDaysOverdue: (issuance) => {
    if (!issuanceService.isOverdue(issuance)) return 0;
    const diff = Date.now() - new Date(issuance.dueDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  },

  /**
   * Derive display status from the contract's status field.
   * Returns: 'Returned' | 'Overdue' | 'Issued'
   */
  getDisplayStatus: (issuance) => {
    if (issuance.status === 'Returned') return 'Returned';
    if (issuanceService.isOverdue(issuance)) return 'Overdue';
    return 'Issued';
  },
};