import { membersApi } from '../api/membersApi';

async function safe(apiCall) {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Normalise whatever shape the backend returns into a plain Member[].
 * Handles:  []  |  { members: [] }  |  { data: [] }  |  null/undefined
 */
function normaliseMemberList(raw) {
  if (Array.isArray(raw))            return raw;
  if (Array.isArray(raw?.members))   return raw.members;
  if (Array.isArray(raw?.data))      return raw.data;
  return [];
}

function sanitiseMemberPayload(raw) {
  return {
    name:  raw.name?.trim()  ?? '',
    email: raw.email?.trim() ?? '',
    phone: raw.phone?.trim() || null,
  };
}

export const memberService = {
  fetchAll: async () => {
    const result = await safe(() => membersApi.getAll());
    if (result.error) return result;
    return { data: normaliseMemberList(result.data), error: null };
  },

  fetchById: (id) =>
    safe(() => membersApi.getById(id)),

  create: (formData) => {
    const payload = sanitiseMemberPayload(formData);
    return safe(() => membersApi.create(payload));
  },

  update: (id, formData) => {
    const payload = sanitiseMemberPayload(formData);
    return safe(() => membersApi.update(id, payload));
  },

  remove: (id) =>
    safe(() => membersApi.remove(id)),
};