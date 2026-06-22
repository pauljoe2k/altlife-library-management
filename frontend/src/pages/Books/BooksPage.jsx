import { useEffect, useReducer, useCallback } from 'react';
import { bookService }     from '../../services/bookService';
import { useNotification } from '../../context/NotificationContext';
import BooksTable          from './components/BooksTable';
import BookFormModal       from './components/BookFormModal';
import BookFilters         from './components/BookFilters';
import styles              from './BooksPage.module.css';

const INITIAL_STATE = {
  books:        [],       // MUST be [] not null — .filter() is called on this
  loading:      true,
  error:        null,
  search:       '',
  modalOpen:    false,
  selectedBook: null,
  submitting:   false,
  deleteId:     null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error:   null,
        // BUG 1 FIX: coerce to array — never trust payload shape
        books:   Array.isArray(action.payload) ? action.payload : [],
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error:   action.payload,
        books:   [],          // reset to [] so .filter() never blows up
      };

    case 'SET_SEARCH':
      return { ...state, search: action.payload };

    case 'OPEN_ADD_MODAL':
      return { ...state, modalOpen: true, selectedBook: null };

    case 'OPEN_EDIT_MODAL':
      return { ...state, modalOpen: true, selectedBook: action.payload };

    case 'CLOSE_MODAL':
      return { ...state, modalOpen: false, selectedBook: null, submitting: false };

    case 'SUBMIT_START':
      return { ...state, submitting: true };

    case 'SUBMIT_END':
      return { ...state, submitting: false };

    case 'DELETE_START':
      return { ...state, deleteId: action.payload };

    case 'DELETE_END':
      return { ...state, deleteId: null };

    default:
      return state;
  }
}

export default function BooksPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { notify }        = useNotification();

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchBooks = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    const { data, error } = await bookService.fetchAll();
    if (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message ?? 'Failed to load books.' });
    } else {
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // ── Filtered list ──────────────────────────────────────────────
  // BUG 1 FIX: (state.books ?? []) ensures .filter() never throws
  // even if a future code path somehow sets books to null/undefined
  const filtered = (state.books ?? []).filter((b) => {
    if (!state.search) return true;
    const q = state.search.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q)  ||
      b.author?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q)
    );
  });

  // ── Submit (add / edit) ────────────────────────────────────────
  async function handleSubmit(formData) {
    dispatch({ type: 'SUBMIT_START' });
    const isEdit = Boolean(state.selectedBook);

    const { error } = isEdit
      ? await bookService.update(state.selectedBook.bookId, formData)
      : await bookService.create(formData);

    dispatch({ type: 'SUBMIT_END' });

    if (error) {
      notify(error.message || 'Failed to save book.', 'error');
      return;   // keep modal open so user can retry
    }

    notify(
      isEdit ? 'Book updated successfully.' : 'Book added successfully.',
      'success',
    );
    dispatch({ type: 'CLOSE_MODAL' });
    fetchBooks();
  }

  // ── Delete ─────────────────────────────────────────────────────
  async function handleDelete(bookId) {
    dispatch({ type: 'DELETE_START', payload: bookId });
    const { error } = await bookService.remove(bookId);
    dispatch({ type: 'DELETE_END' });

    if (error) {
      notify(error.message || 'Failed to delete book.', 'error');
      return;
    }

    notify('Book deleted successfully.', 'success');
    fetchBooks();
  }

  return (
    <div className={styles.page}>

      <div className={styles.header}>
        <p className={styles.subtitle}>
          Manage your library catalogue — add, edit, or remove books.
        </p>
        <button
          className={styles.addBtn}
          onClick={() => dispatch({ type: 'OPEN_ADD_MODAL' })}
        >
          + Add Book
        </button>
      </div>

      <BookFilters
        search={state.search}
        onSearchChange={(val) => dispatch({ type: 'SET_SEARCH', payload: val })}
        totalShown={filtered.length}
        totalAll={state.books.length}
      />

      <BooksTable
        books={filtered}
        loading={state.loading}
        error={state.error}
        deleteId={state.deleteId}
        onEdit={(book) => dispatch({ type: 'OPEN_EDIT_MODAL', payload: book })}
        onDelete={handleDelete}
        onRetry={fetchBooks}
      />

      {state.modalOpen && (
        <BookFormModal
          initialData={state.selectedBook}
          submitting={state.submitting}
          onSubmit={handleSubmit}
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        />
      )}
    </div>
  );
}