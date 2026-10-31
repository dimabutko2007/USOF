import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../store/authSlice';
import { LogIn, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!login.trim()) errs.login = 'Login or email is required.';
    if (!password) errs.password = 'Password is required.';
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    if (!validate()) return;

    const result = await dispatch(loginUser({ login: login.trim(), password }));
    if (!result.error) {
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '2rem auto' }}>
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
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Welcome Back</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Log in to your USOF developer account
          </p>
        </div>

        {error && (
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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. johndoe or user@example.com"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoFocus
            />
            {validationErrors.login && <span className="form-error">{validationErrors.login}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <Link to="/password-reset" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {validationErrors.password && <span className="form-error">{validationErrors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

