import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '65vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="card fade-in"
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          padding: '3rem 2rem',
          boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.2))',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--border-color)',
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        }}
      >
        {/* Brand Logo with Glow */}
        <div style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          <Link to="/" title="USOF Home">
            <img
              src="/logo.png"
              alt="USOF Logo"
              style={{
                height: '76px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 14px rgba(99, 102, 241, 0.28))',
                transition: 'transform var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          </Link>
        </div>

        {/* 404 Status Badge */}
        <div style={{ marginBottom: '1rem' }}>
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              fontSize: '2.5rem',
              letterSpacing: '-1px',
              color: 'var(--accent-primary)',
              lineHeight: 1,
            }}
          >
            404
          </span>
        </div>

        {/* Heading & Subtitle */}
        <h1
          style={{
            fontSize: '1.45rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.65rem',
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '380px',
            margin: '0 auto 2rem',
          }}
        >
          The discussion, tag, or page you are looking for does not exist or may have been removed.
        </p>

        {/* Minimalist Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            <Home size={16} />
            <span>Community Feed</span>
          </Link>

          <Link to="/categories" className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>
            <Compass size={16} />
            <span>Explore Topics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

