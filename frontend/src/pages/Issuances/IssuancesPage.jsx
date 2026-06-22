import { useEffect, useReducer, useCallback } from 'react';
import { issuanceService } from '../../services/issuanceService';
import { useNotification } from '../../context/NotificationContext';
import IssuancesTable      from './components/IssuancesTable';
import IssueBookModal      from './components/IssueBookModal';
import IssuanceFilters     from './components/IssuanceFilters';
import ConfirmDialog       from './components/ConfirmDialog';
import styles              from './IssuancesPage.module.css';

const INITIAL_STATE = {
  issuances:     [],
  loading:       true,
  error:         null,
  search:        '',
  statusFilter:  'all',

  // Issue modal
  issueModalOpen: false,
  submitting:     false,

  // Return confirmation
  returnConfirm:  null,   // issuance id to return, or null
  returning:      false,

  // Delete confirmation
  deleteConfirm:  null,   // full issuance object, or null
  deleting:       false,

  // Row-level action indicator
  actionId:       null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading:    false,
        error:      null,
        issuances:  Array.isArray(action.payload) ? action.payload : [],
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload, issuances: [] };

    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };

    // Issue modal
    case 'OPEN_ISSUE_MODAL':
      return { ...state, issueModalOpen: true };
    case 'CLOSE_ISSUE_MODAL':
      return { ...state, issueModalOpen: false, submitting: false };
    case 'SUBMIT_START':
      return { ...state, submitting: true };
    case 'SUBMIT_END':
      return { ...state, submitting: false };

    // Return confirmation
    case 'OPEN_RETURN_CONFIRM':
      return { ...state, returnConfirm: action.payload };
    case 'CLOSE_RETURN_CONFIRM':
      return { ...state, returnConfirm: null, returning: false };
    case 'RETURN_START':
      return { ...state, returning: true, actionId: action.payload };
    case 'RETURN_END':
      return { ...state, returning: false, actionId: null };

    // Delete confirmation
    case 'OPEN_DELETE_CONFIRM':
      return { ...state, deleteConfirm: action.payload };
    case 'CLOSE_DELETE_CONFIRM':
      return { ...state, deleteConfirm: null, deleting: false };
    case 'DELETE_START':
      return { ...state, deleting: true, actionId: action.payload };
    case 'DELETE_END':
      return { ...state, deleting: false, actionId: null };

    default:
      return state;
  }
}

export default function IssuancesPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { notify }        = useNotification();

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchIssuances = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    const { data, error } = await issuanceService.fetchAll();
    if (error) {
      dispatch({
        type:    'FETCH_ERROR',
        payload: error.message ?? 'Failed to load issuances.',
      });
    } else {
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    }
  }, []);

  useEffect(() => { fetchIssuances(); }, [fetchIssuances]);

  // ── Filtered list ─────────────────────────────────────────────
  const filtered = (state.issuances ?? []).filter((i) => {
    // Status filter
    if (state.statusFilter !== 'all') {
      const display = issuanceService.getDisplayStatus(i);
      if (display !== state.statusFilter) return false;
    }

    // Search filter
    if (state.search) {
      const q = state.search.toLowerCase();
      const memberMatch =
        i.member?.name?.toLowerCase().includes(q)  ||
        i.member?.email?.toLowerCase().includes(q);
      const bookMatch =
        i.book?.title?.toLowerCase().includes(q)   ||
        i.book?.author?.toLowerCase().includes(q);
      if (!memberMatch && !bookMatch) return false;
    }

    return true;
  });

  // ── Issue book ────────────────────────────────────────────────
  async function handleIssueSubmit(formData) {
    dispatch({ type: 'SUBMIT_START' });
    const { error } = await issuanceService.issue(formData);
    dispatch({ type: 'SUBMIT_END' });

    if (error) {
      notify(error.message || 'Failed to issue book.', 'error');
      return;
    }

    notify('Book issued successfully.', 'success');
    dispatch({ type: 'CLOSE_ISSUE_MODAL' });
    fetchIssuances();
  }

  // ── Return book ───────────────────────────────────────────────
  async function handleReturnConfirm() {
    const id = state.returnConfirm;
    dispatch({ type: 'RETURN_START', payload: id });
    dispatch({ type: 'CLOSE_RETURN_CONFIRM' });

    const { error } = await issuanceService.returnBook(id);
    dispatch({ type: 'RETURN_END' });

    if (error) {
      notify(error.message || 'Failed to return book.', 'error');
      return;
    }

    notify('Book returned successfully.', 'success');
    fetchIssuances();
  }

  // ── Delete ────────────────────────────────────────────────────
  async function handleDeleteConfirm() {
    const issuance = state.deleteConfirm;
    dispatch({ type: 'DELETE_START', payload: issuance.id });
    dispatch({ type: 'CLOSE_DELETE_CONFIRM' });

    const { error } = await issuanceService.remove(issuance.id);
    dispatch({ type: 'DELETE_END' });

    if (error) {
      notify(error.message || 'Failed to delete issuance.', 'error');
      return;
    }

    notify('Issuance deleted.', 'success');
    fetchIssuances();
  }

  // ── Stat counters ─────────────────────────────────────────────
  const counts = (state.issuances ?? []).reduce(
    (acc, i) => {
      const s = issuanceService.getDisplayStatus(i);
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    { Issued: 0, Overdue: 0, Returned: 0 },
  );

  return (
    <div className={styles.page}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div className={styles.header}>
        <p className={styles.subtitle}>
          Track book issuances, process returns and manage records.
        </p>
        <button
          className={styles.issueBtn}
          onClick={() => dispatch({ type: 'OPEN_ISSUE_MODAL' })}
        >
          + Issue Book
        </button>
      </div>

      {/* ── Stat pills ────────────────────────────────────────── */}
      {!state.loading && !state.error && (
        <div className={styles.statRow}>
          {[
            { label: 'Issued',   count: counts.Issued,   mod: styles.statIssued   },
            { label: 'Overdue',  count: counts.Overdue,  mod: styles.statOverdue  },
            { label: 'Returned', count: counts.Returned, mod: styles.statReturned },
          ].map(({ label, count, mod }) => (
            <div key={label} className={`${styles.statPill} ${mod}`}>
              <span className={styles.statCount}>{count}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ───────────────────────────────────────────── */}
      <IssuanceFilters
        search={state.search}
        statusFilter={state.statusFilter}
        onSearchChange={(val) => dispatch({ type: 'SET_SEARCH',        payload: val })}
        onStatusChange={(val) => dispatch({ type: 'SET_STATUS_FILTER', payload: val })}
        totalShown={filtered.length}
        totalAll={state.issuances.length}
      />

      {/* ── Table ─────────────────────────────────────────────── */}
      <IssuancesTable
        issuances={filtered}
        loading={state.loading}
        error={state.error}
        actionId={state.actionId}
        onReturn={(id) => dispatch({ type: 'OPEN_RETURN_CONFIRM', payload: id })}
        onDelete={(issuance) => dispatch({ type: 'OPEN_DELETE_CONFIRM', payload: issuance })}
        onRetry={fetchIssuances}
      />

      {/* ── Issue modal ────────────────────────────────────────── */}
      {state.issueModalOpen && (
        <IssueBookModal
          submitting={state.submitting}
          onSubmit={handleIssueSubmit}
          onClose={() => dispatch({ type: 'CLOSE_ISSUE_MODAL' })}
        />
      )}

      {/* ── Return confirmation ────────────────────────────────── */}
      <ConfirmDialog
        isOpen={state.returnConfirm !== null}
        title="Return Book"
        message="Confirm that this book has been physically returned. This action cannot be undone."
        confirmLabel="Confirm Return"
        cancelLabel="Cancel"
        variant="warning"
        loading={state.returning}
        onConfirm={handleReturnConfirm}
        onCancel={() => dispatch({ type: 'CLOSE_RETURN_CONFIRM' })}
      />

      {/* ── Delete confirmation ────────────────────────────────── */}
      <ConfirmDialog
        isOpen={state.deleteConfirm !== null}
        title="Delete Issuance"
        message={
          state.deleteConfirm
            ? `Permanently delete the issuance record for "${
                state.deleteConfirm.book?.title ?? 'this book'
              }" issued to "${
                state.deleteConfirm.member?.name ?? 'this member'
              }"? This cannot be undone.`
            : 'Delete this issuance record?'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={state.deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => dispatch({ type: 'CLOSE_DELETE_CONFIRM' })}
      />
    </div>
  );
}