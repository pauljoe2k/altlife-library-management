import { useEffect, useReducer, useCallback } from 'react';
import { memberService }   from '../../services/memberService';
import { useNotification } from '../../context/NotificationContext';
import MembersTable        from './components/MembersTable';
import MemberFormModal     from './components/MemberFormModal';
import MemberFilters       from './components/MemberFilters';
import styles              from './MembersPage.module.css';

const INITIAL_STATE = {
  members:        [],
  loading:        true,
  error:          null,
  search:         '',
  modalOpen:      false,
  selectedMember: null,   // null = add mode, object = edit mode
  submitting:     false,
  deleteId:       null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading:  false,
        error:    null,
        members:  Array.isArray(action.payload) ? action.payload : [],
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        loading:  false,
        error:    action.payload,
        members:  [],
      };

    case 'SET_SEARCH':
      return { ...state, search: action.payload };

    case 'OPEN_ADD_MODAL':
      return { ...state, modalOpen: true, selectedMember: null };

    case 'OPEN_EDIT_MODAL':
      return { ...state, modalOpen: true, selectedMember: action.payload };

    case 'CLOSE_MODAL':
      return {
        ...state,
        modalOpen:      false,
        selectedMember: null,
        submitting:     false,
      };

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

export default function MembersPage() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { notify }        = useNotification();

  // ── Fetch ────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    const { data, error } = await memberService.fetchAll();
    if (error) {
      dispatch({
        type:    'FETCH_ERROR',
        payload: error.message ?? 'Failed to load members.',
      });
    } else {
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ── Filtered list (client-side search) ────────────────────────
  const filtered = (state.members ?? []).filter((m) => {
    if (!state.search) return true;
    const q = state.search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q)  ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q)
    );
  });

  // ── Add / Edit submit ────────────────────────────────────────
  async function handleSubmit(formData) {
    dispatch({ type: 'SUBMIT_START' });
    const isEdit = Boolean(state.selectedMember);

    const { error } = isEdit
      ? await memberService.update(state.selectedMember.memberId, formData)
      : await memberService.create(formData);

    dispatch({ type: 'SUBMIT_END' });

    if (error) {
      notify(error.message || 'Failed to save member.', 'error');
      return;
    }

    notify(
      isEdit ? 'Member updated successfully.' : 'Member added successfully.',
      'success',
    );
    dispatch({ type: 'CLOSE_MODAL' });
    fetchMembers();
  }

  // ── Delete ───────────────────────────────────────────────────
  async function handleDelete(memberId) {
    dispatch({ type: 'DELETE_START', payload: memberId });
    const { error } = await memberService.remove(memberId);
    dispatch({ type: 'DELETE_END' });

    if (error) {
      notify(error.message || 'Failed to delete member.', 'error');
      return;
    }

    notify('Member deleted successfully.', 'success');
    fetchMembers();
  }

  return (
    <div className={styles.page}>

      {/* ── Page header ──────────────────────────────────────── */}
      <div className={styles.header}>
        <p className={styles.subtitle}>
          Manage library members — add, edit, or remove accounts.
        </p>
        <button
          className={styles.addBtn}
          onClick={() => dispatch({ type: 'OPEN_ADD_MODAL' })}
        >
          + Add Member
        </button>
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <MemberFilters
        search={state.search}
        onSearchChange={(val) => dispatch({ type: 'SET_SEARCH', payload: val })}
        totalShown={filtered.length}
        totalAll={state.members.length}
      />

      {/* ── Table ────────────────────────────────────────────── */}
      <MembersTable
        members={filtered}
        loading={state.loading}
        error={state.error}
        deleteId={state.deleteId}
        onEdit={(member) => dispatch({ type: 'OPEN_EDIT_MODAL', payload: member })}
        onDelete={handleDelete}
        onRetry={fetchMembers}
      />

      {/* ── Modal ────────────────────────────────────────────── */}
      {state.modalOpen && (
        <MemberFormModal
          initialData={state.selectedMember}
          submitting={state.submitting}
          onSubmit={handleSubmit}
          onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
        />
      )}
    </div>
  );
}