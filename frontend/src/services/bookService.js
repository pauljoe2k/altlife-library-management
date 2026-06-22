import { booksApi } from '../api/booksApi';

async function safe(apiCall) {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Normalise whatever shape the backend returns into a plain Book[].
 * Handles:  []  |  { books: [] }  |  { data: [] }  |  null / undefined
 */
function normaliseBookList(raw) {
  if (Array.isArray(raw))          return raw;
  if (Array.isArray(raw?.books))   return raw.books;
  if (Array.isArray(raw?.data))    return raw.data;
  return [];
}

function sanitiseBookPayload(raw) {
  return {
    title:        raw.title?.trim()        ?? '',
    author:       raw.author?.trim()       ?? '',
    isbn:         raw.isbn?.trim()  || null,
    totalCopies:  raw.totalCopies !== '' && raw.totalCopies !== null
                    ? Number(raw.totalCopies)
                    : null,
  };
}

export const bookService = {
  fetchAll: async () => {
    const result = await safe(() => booksApi.getAll());
    if (result.error) return result;
    return { data: normaliseBookList(result.data), error: null };
  },

  fetchById: (id) =>
    safe(() => booksApi.getById(id)),

  create: (formData) => {
    const payload = sanitiseBookPayload(formData);
    return safe(() => booksApi.create(payload));
  },

  update: (id, formData) => {
    const payload = sanitiseBookPayload(formData);
    return safe(() => booksApi.update(id, payload));
  },

  remove: (id) =>
    safe(() => booksApi.remove(id)),
};