import { useState, useEffect, useCallback } from 'react';
import { memberService }   from '../../../services/memberService';
import { bookService }     from '../../../services/bookService';
import styles              from './IssueBookModal.module.css';

const EMPTY_FORM = {
  memberId: '',
  bookId:   '',
  dueDate:  '',
};

function validate(values) {
  const errors = {};
  if (!values.memberId) errors.memberId = 'Please select a member.';
  if (!values.bookId)   errors.bookId   = 'Please select a book.';
  if (!values.dueDate)  errors.dueDate  = 'Due date is required.';
  else {
    const due  = new Date(values.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due < today) errors.dueDate = 'Due date must be today or later.';
  }
  return errors;
}

/**
 * IssueBookModal
 * Props:
 *   submitting  {boolean}
 *   onSubmit    {fn(formData)}
 *   onClose     {fn}
 */
export default function IssueBookModal({ submitting, onSubmit, onClose }) {
  const [values,       setValues]       = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});
  const [touched,      setTouched]      = useState({});
  const [members,      setMembers]      = useState([]);
  const [books,        setBooks]        = useState([]);
  const [loadingData,  setLoadingData]  = useState(true);
  const [loadError,    setLoadError]    = useState(null);

  // ── Fetch members + books for dropdowns ──────────────────────
  useEffect(() => {
    async function loadDropdownData() {
      setLoadingData(true);
      const [membersResult, booksResult] = await Promise.all([
        memberService.fetchAll(),
        bookService.fetchAll(),
      ]);

      if (membersResult.error || booksResult.error) {
        setLoadError('Failed to load members or books. Please close and try again.');
      } else {
        setMembers(membersResult.data ?? []);
        setBooks(booksResult.data ?? []);
      }
      setLoadingData(false);
    }

    loadDropdownData();
  }, []);

  // ── Close on Escape ──────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape' && !submitting) onClose(); },
    [submitting, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Min date = today in YYYY-MM-DD format ────────────────────
  const minDate = new Date().toISOString().split('T')[0];

  // ── Handlers ─────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validate(values);
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(EMPTY_FORM).map((k) => [k, true]),
    );
    setTouched(allTouched);

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      memberId: Number(values.memberId),
      bookId:   Number(values.bookId),
      dueDate:  values.dueDate,
    });
  }

  const showError = (field) => touched[field] && errors[field];

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className={styles.modal}>

        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <div className={styles.iconWrap}>
              <span aria-hidden="true">📖</span>
            </div>
            <h2 id="issue-modal-title" className={styles.modalTitle}>
              Issue Book
            </h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        {loadingData ? (
          <div className={styles.loadingBody}>
            <div className={styles.spinner} aria-label="Loading…" />
            <p className={styles.loadingText}>Loading members and books…</p>
          </div>
        ) : loadError ? (
          <div className={styles.errorBody}>
            <span aria-hidden="true">⚠</span>
            <p>{loadError}</p>
            <button className={styles.closeLinkBtn} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* Member select */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="issue-member">
                Member <span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="issue-member"
                  name="memberId"
                  className={`${styles.select} ${showError('memberId') ? styles.selectError : ''}`}
                  value={values.memberId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                >
                  <option value="">— Select a member —</option>
                  {members.map((m) => (
                    <option key={m.memberId} value={m.memberId}>
                      {m.name}
                      {m.email ? ` · ${m.email}` : ''}
                    </option>
                  ))}
                </select>
                <span className={styles.selectArrow} aria-hidden="true">▾</span>
              </div>
              {showError('memberId') && (
                <p className={styles.errorMsg} role="alert">{errors.memberId}</p>
              )}
            </div>

            {/* Book select */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="issue-book">
                Book <span className={styles.required}>*</span>
              </label>
              <div className={styles.selectWrap}>
                <select
                  id="issue-book"
                  name="bookId"
                  className={`${styles.select} ${showError('bookId') ? styles.selectError : ''}`}
                  value={values.bookId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                >
                  <option value="">— Select a book —</option>
                  {books.map((b) => (
                    <option key={b.bookId} value={b.bookId}>
                      {b.title}
                      {b.author ? ` — ${b.author}` : ''}
                    </option>
                  ))}
                </select>
                <span className={styles.selectArrow} aria-hidden="true">▾</span>
              </div>
              {showError('bookId') && (
                <p className={styles.errorMsg} role="alert">{errors.bookId}</p>
              )}
            </div>

            {/* Due date */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="issue-due">
                Due Date <span className={styles.required}>*</span>
              </label>
              <input
                id="issue-due"
                name="dueDate"
                type="date"
                min={minDate}
                className={`${styles.input} ${showError('dueDate') ? styles.inputError : ''}`}
                value={values.dueDate}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={submitting}
              />
              {showError('dueDate') && (
                <p className={styles.errorMsg} role="alert">{errors.dueDate}</p>
              )}
            </div>

            {/* Summary preview */}
            {values.memberId && values.bookId && values.dueDate && (
              <div className={styles.preview}>
                <p className={styles.previewLabel}>Issuance summary</p>
                <p className={styles.previewText}>
                  <strong>
                    {members.find((m) => String(m.memberId) === String(values.memberId))?.name ?? ''}
                  </strong>
                  {' '}will borrow{' '}
                  <strong>
                    {books.find((b) => String(b.bookId) === String(values.bookId))?.title ?? ''}
                  </strong>
                  {' '}until{' '}
                  <strong>
                    {new Date(values.dueDate).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </strong>.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? 'Issuing…' : 'Issue Book'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}