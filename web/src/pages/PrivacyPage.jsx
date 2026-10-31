import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  EyeOff,
  Database,
  Cookie,
  UserCheck,
  ArrowLeft,
  Mail,
} from 'lucide-react';

const PrivacyPage = () => {
  const sections = [
    {
      title: 'Minimal Data Collection',
      icon: <Database size={22} color="var(--accent-primary)" />,
      content:
        'We believe in data minimization. We only collect and store your email address, username (login), and full name to create and authenticate your account. We do not track location or personal demographic details.',
    },
    {
      title: 'Zero Third-Party Sharing',
      icon: <EyeOff size={22} color="var(--color-success)" />,
      content:
        'Your data belongs to you. We do not sell, rent, monetize, or disclose your personal information or email to any third-party marketing networks, data brokers, or advertisers under any circumstances.',
    },
    {
      title: 'Strict Password & Credential Security',
      icon: <Lock size={22} color="var(--accent-primary)" />,
      content:
        'Passwords are never stored in plain text. All credentials are cryptographically hashed using salted bcrypt before writing to the database. Even platform administrators cannot read or reverse your password.',
    },
    {
      title: 'Session Cookies Only',
      icon: <Cookie size={22} color="var(--color-warning)" />,
      content:
        'We use a secure, HTTP-only session cookie (usof_sid) strictly to maintain your logged-in state across page reloads. We do not use third-party analytics trackers, behavioral profiling, or advertising pixels.',
    },
    {
      title: 'Public Content & Anonymity',
      icon: <UserCheck size={22} color="var(--accent-primary)" />,
      content:
        'Questions, answers, comments, and ratings that you choose to publish are visible to the community under your chosen username. You maintain full ownership and can edit or remove your submissions at any time.',
    },
    {
      title: 'Account Deletion & Data Rights',
      icon: <Mail size={22} color="var(--color-danger)" />,
      content:
        'You have the right to inspect, update, or completely delete your account and associated personal data at any time through your Profile settings or by contacting an administrator.',
    },
  ];

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header Banner */}
      <div
        className="card fade-in"
        style={{
          marginBottom: '1.5rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
          borderLeft: '4px solid var(--color-success)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.65rem' }}>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'inline-flex',
            }}
          >
            <Shield size={26} color="var(--color-success)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 700, margin: 0 }}>Privacy Policy</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Transparent, privacy-first principles: we only store your email for authentication.
            </p>
          </div>
        </div>
      </div>

      {/* Highlights Box */}
      <div
        className="card fade-in"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--accent-light, rgba(99, 102, 241, 0.08))',
          border: '1px solid var(--accent-primary)',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          💡 <strong>Key Summary:</strong> We only store your email address for account authentication.
          We never share, sell, or disclose your personal data to third parties.
        </p>
      </div>

      {/* Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {sections.map((sec, idx) => (
          <div key={idx} className="card fade-in" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
              {sec.icon}
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{sec.title}</h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {sec.content}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
        <Link to="/guidelines" className="btn btn-outline btn-sm">
          <span>Community Guidelines →</span>
        </Link>
      </div>
    </div>
  );
};

export default PrivacyPage;
