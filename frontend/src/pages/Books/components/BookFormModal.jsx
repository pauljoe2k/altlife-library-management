import { useState, useEffect, useCallback } from 'react';
import styles from './BookFormModal.module.css';

const EMPTY_FORM = {
  title:        '',
  author:       '',
  isbn:         '',
  totalCopies:  '',
};

function validate(values) {
  const errors = {};
  if (!values.title.trim())  errors.title  = 'Title is required.';
  if (!values.author.trim()) errors.author = 'Author is required.';
  if (
    values.totalCopies !== '' &&
    (isNaN(Number(values.totalCopies)) || Number(values.totalCopies) < 0)
  ) {
    errors.totalCopies = 'Must be a positive number.';
  }
  return errors;
}

/**
 * BookFormModal
 * Props:
 *   initialData  {object|null}   — null = add mode, object = edit mode
 *   submitting   {boolean}
 *   onSubmit     {fn(formData)}
 *   onClose      {fn}
 */
export default function BookFormModal({ initialData, submitting, onSubmit, onClose }) {
  const isEdit = Boolean(initialData);

  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setValues({
        title:       initialData.title        ?? '',
        author:      initialData.author       ?? '',
        isbn:        initialData.isbn         ?? '',
        totalCopies: initialData.totalCopies !== null
                     && initialData.totalCopies !== undefined
                       ? String(initialData.totalCopies)
                       : '',
      });
    }
  }, [initialData]);

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !submitting) onClose();
  }, [submitting, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validate({ ...values, [name]: values[name] });
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(EMPTY_FORM).map((k) => [k, true]));
    setTouched(allTouched);

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      title:       values.title.trim(),
      author:      values.author.trim(),
      isbn:        values.isbn.trim() || null,
      totalCopies: values.totalCopies !== '' ? Number(values.totalCopies) : null,
    });
  }

  const showError = (field) => touched[field] && errors[field];

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
    >
      <div className={styles.modal}>

        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {isEdit ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Form ── */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">
              Title <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={`${styles.input} ${showError('title') ? styles.inputError : ''}`}
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. The Great Gatsby"
              disabled={submitting}
              autoFocus
            />
            {showError('title') && (
              <p className={styles.errorMsg}>{errors.title}</p>
            )}
          </div>

          {/* Author */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="author">
              Author <span className={styles.required}>*</span>
            </label>
            <input
              id="author"
              name="author"
              type="text"
              className={`${styles.input} ${showError('author') ? styles.inputError : ''}`}
              value={values.author}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. F. Scott Fitzgerald"
              disabled={submitting}
            />
            {showError('author') && (
              <p className={styles.errorMsg}>{errors.author}</p>
            )}
          </div>

          {/* ISBN + Copies (two columns) */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="isbn">
                ISBN <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="isbn"
                name="isbn"
                type="text"
                className={styles.input}
                value={values.isbn}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 978-3-16-148410-0"
                disabled={submitting}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="totalCopies">
                Copies <span className={styles.optional}>(optional)</span>
              </label>
              <input
                id="totalCopies"
                name="totalCopies"
                type="number"
                min="0"
                className={`${styles.input} ${showError('totalCopies') ? styles.inputError : ''}`}
                value={values.totalCopies}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 3"
                disabled={submitting}
              />
              {showError('totalCopies') && (
                <p className={styles.errorMsg}>{errors.totalCopies}</p>
              )}
            </div>
          </div>

          {/* ── Footer actions ── */}
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
              {submitting
                ? (isEdit ? 'Saving…' : 'Adding…')
                : (isEdit ? 'Save Changes' : 'Add Book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}