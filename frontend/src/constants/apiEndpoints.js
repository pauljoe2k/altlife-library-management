// ─────────────────────────────────────────────────────────────────
// Single source of truth for every API path.
// Functions for parameterised routes keep interpolation out of
// the api/ and service/ layers entirely.
// ─────────────────────────────────────────────────────────────────
export const ENDPOINTS = {
  // ── Books ──────────────────────────────────────────────────────
  BOOKS:           '/books',
  BOOK_BY_ID:      (id) => `/books/${id}`,

  // ── Members ────────────────────────────────────────────────────
  MEMBERS:         '/members',
  MEMBER_BY_ID:    (id) => `/members/${id}`,

  // ── Issuances ──────────────────────────────────────────────────
  ISSUANCES:       '/issuances',
  ISSUANCE_BY_ID:  (id) => `/issuances/${id}`,
  RETURN_BOOK:     (id) => `/issuances/${id}/return`,
};