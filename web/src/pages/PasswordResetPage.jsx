import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { KeyRound, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const PasswordResetPage = () => {
  const [step, setStep] = useState(1); // 1: Request, 2: Reset
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Please enter your email address.');

    setLoading(true);
    setError(null);
    try {
      const res = await authApi.requestPasswordReset(email.trim());
      setSuccessMessage(res.message);
      if (res.resetToken) {
        setToken(res.resetToken);
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!token.trim()) return setError('Reset token is required.');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== passwordConfirmation) return setError('Passwords do not match.');

    setLoading(true);
    setError(null);
    try {
      const res = await authApi.confirmPasswordReset(token.trim(), password, passwordConfirmation);
      setSuccessMessage(res.message);
      setStep(3); // Completed
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="card fade-in" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-light)', marginBottom: '0.75rem' }}>
            <KeyRound size={32} color="var(--accent-primary)" />
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Reset Password</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Recover access to your USOF account
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

        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div className="form-group">
              <label className="form-label">Registered Account Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Sending Link...' : 'Send Password Reset Link'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setStep(2)}
              >
                Already have a reset token? Click here
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConfirmReset}>
            {successMessage && (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', marginBottom: '1rem' }}>
                {successMessage}
              </p>
            )}
            <div className="form-group">
              <label className="form-label">Reset Token</label>
              <input
                type="text"
                className="form-input"
                placeholder="Paste the reset token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="New password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Password Reset Complete!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Your password has been changed. You can now sign in with your new credentials.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Sign In
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;

