import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    login: '',
    full_name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.login.trim() || formData.login.trim().length < 3) {
      errs.login = 'Login must be at least 3 characters.';
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.passwordConfirmation) {
      errs.passwordConfirmation = 'Passwords do not match.';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.register({
        login: formData.login.trim(),
        full_name: formData.full_name.trim() || formData.login.trim(),
        email: formData.email.trim(),
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
      });
      setSuccessData(res);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '2rem auto' }}>
      <div className="card fade-in" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.4rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
            <img
              src="/logo.png"
              alt="USOF Logo"
              style={{
                height: '62px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2))',
              }}
            />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Join the Community</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Create your account to ask, answer, and bookmark questions
          </p>
        </div>

        {apiError && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {successData ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Registration Successful!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {successData.message}
            </p>

            {successData.confirmToken && (
              <div
                className="card"
                style={{
                  background: 'var(--bg-input)',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.4rem' }}>
                  Demo Environment Quick-Activation:
                </div>
                <a
                  href={`/api/auth/confirm-email/${successData.confirmToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                >
                  Click Here to Instant Confirm Email
                </a>
              </div>
            )}

            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="login"
                className="form-input"
                placeholder="e.g. alexdev"
                value={formData.login}
                onChange={handleChange}
              />
              {validationErrors.login && <span className="form-error">{validationErrors.login}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="full_name"
                className="form-input"
                placeholder="e.g. Alex Developer"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {validationErrors.email && <span className="form-error">{validationErrors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
              {validationErrors.password && <span className="form-error">{validationErrors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="passwordConfirmation"
                className="form-input"
                placeholder="Repeat password"
                value={formData.passwordConfirmation}
                onChange={handleChange}
              />
              {validationErrors.passwordConfirmation && (
                <span className="form-error">{validationErrors.passwordConfirmation}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <UserPlus size={16} />
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

