import { useState, useEffect, useCallback } from 'react';
import styles from './MemberFormModal.module.css';

const EMPTY_FORM = {
  name:  '',
  email: '',
  phone: '',
};

// ── Validators ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-().]{7,20}$/;

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  return errors;
}

/**
 * MemberFormModal
 * Props:
 *   initialData  {object|null}  — null = add mode, object = edit mode
 *   submitting   {boolean}
 *   onSubmit     {fn(formData)}
 *   onClose      {fn}
 */
export default function MemberFormModal({
  initialData,
  submitting,
  onSubmit,
  onClose,
}) {
  const isEdit = Boolean(initialData);

  const [values,  setValues]  = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  // Populate or reset form when modal opens
  useEffect(() => {
    if (initialData) {
      setValues({
        name:  initialData.name  ?? '',
        email: initialData.email ?? '',
        phone: initialData.phone ?? '',
      });
    } else {
      setValues(EMPTY_FORM);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape' && !submitting) onClose(); },
    [submitting, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Field handlers ──────────────────────────────────────────
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

  // ── Submit ──────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();

    // Touch all fields to surface every error at once
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
      name:  values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim() || null,
    });
  }

  const showError = (field) => touched[field] && errors[field];

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className={styles.modal}>

        {/* ── Header ── */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <div className={styles.modalIconWrap}>
              <span aria-hidden="true">👤</span>
            </div>
            <h2 id="member-modal-title" className={styles.modalTitle}>
              {isEdit ? 'Edit Member' : 'Add New Member'}
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

        {/* ── Form ── */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="member-name">
              Full Name <span className={styles.required}>*</span>
            </label>
            <input
              id="member-name"
              name="name"
              type="text"
              autoComplete="name"
              className={`${styles.input} ${showError('name') ? styles.inputError : ''}`}
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Jane Doe"
              disabled={submitting}
              autoFocus
            />
            {showError('name') && (
              <p className={styles.errorMsg} role="alert">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="member-email">
              Email Address <span className={styles.required}>*</span>
            </label>
            <input
              id="member-email"
              name="email"
              type="email"
              autoComplete="email"
              className={`${styles.input} ${showError('email') ? styles.inputError : ''}`}
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. jane@example.com"
              disabled={submitting}
            />
            {showError('email') && (
              <p className={styles.errorMsg} role="alert">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="member-phone">
              Phone Number{' '}
              <span className={styles.optional}>(optional)</span>
            </label>
            <div className={styles.phoneWrap}>
              <span className={styles.phonePrefix} aria-hidden="true">
                📞
              </span>
              <input
                id="member-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className={`${styles.input} ${styles.phoneInput} ${
                  showError('phone') ? styles.inputError : ''
                }`}
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. +91 98765 43210"
                disabled={submitting}
              />
            </div>
            {showError('phone') && (
              <p className={styles.errorMsg} role="alert">{errors.phone}</p>
            )}
          </div>

          {/* ── Footer ── */}
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
                ? isEdit ? 'Saving…'   : 'Adding…'
                : isEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}