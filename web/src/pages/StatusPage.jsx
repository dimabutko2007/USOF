import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Server,
  Database,
  ShieldCheck,
  ArrowLeft,
  Code2,
} from 'lucide-react';

const StatusPage = () => {
  const [healthData, setHealthData] = useState(null);
  const [latency, setLatency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      const res = await fetch('/api/health');
      const endTime = performance.now();
      const roundTrip = Math.round(endTime - startTime);
      setLatency(roundTrip);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Unable to connect to USOF API');
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'Running';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const isHealthy = !error && healthData?.status === 'success';

  const services = [
    {
      name: 'USOF Core REST API',
      description: 'Public API endpoints, queries, and mutations',
      icon: <Server size={20} color="var(--accent-primary)" />,
      status: isHealthy ? 'Operational' : 'Degraded',
    },
    {
      name: 'MySQL Database Pool',
      description: 'Connection pool, transactions, and relational storage',
      icon: <Database size={20} color="var(--color-success)" />,
      status: isHealthy ? 'Operational' : 'Unavailable',
    },
    {
      name: 'Session & Auth Service',
      description: 'Session store, salted bcrypt passwords, and tokens',
      icon: <ShieldCheck size={20} color="var(--accent-primary)" />,
      status: isHealthy ? 'Operational' : 'Checking',
    },
    {
      name: 'Media & Uploads CDN',
      description: 'Static post diagrams, avatars, and file uploads',
      icon: <Activity size={20} color="var(--color-warning)" />,
      status: isHealthy ? 'Operational' : 'Operational',
    },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Top Banner Card */}
      <div
        className="card fade-in"
        style={{
          padding: '2.25rem 2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-lg, 16px)',
          border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          background: isHealthy
            ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, var(--bg-card) 100%)'
            : 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-card) 100%)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <img
            src="/logo.png"
            alt="USOF Logo"
            style={{
              height: '52px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
            }}
          />
        </div>

        {/* Live Status Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          {isHealthy ? (
            <CheckCircle2 size={28} color="var(--color-success)" />
          ) : (
            <AlertCircle size={28} color="var(--color-danger)" />
          )}
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0 }}>
            {isHealthy ? 'All Systems Operational' : 'API Connection Issue'}
          </h1>
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
          {isHealthy
            ? healthData?.message || 'USOF API Server is running smoothly with optimal response times.'
            : error || 'Unable to establish a connection with the USOF API server.'}
        </p>

        {/* Quick Metrics Pills */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '0.65rem 1.25rem',
            borderRadius: '999px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            fontSize: '0.86rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isHealthy ? 'var(--color-success)' : 'var(--color-danger)',
                boxShadow: isHealthy ? '0 0 8px var(--color-success)' : 'none',
              }}
            />
            <span style={{ fontWeight: 600 }}>{isHealthy ? 'Healthy' : 'Error'}</span>
          </div>

          <div style={{ color: 'var(--border-color)' }}>|</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
            <Activity size={14} />
            <span>Latency: <strong style={{ color: 'var(--text-primary)' }}>{latency !== null ? `${latency} ms` : '—'}</strong></span>
          </div>

          {healthData?.uptime !== undefined && (
            <>
              <div style={{ color: 'var(--border-color)' }}>|</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                <Clock size={14} />
                <span>Uptime: <strong style={{ color: 'var(--text-primary)' }}>{formatUptime(healthData.uptime)}</strong></span>
              </div>
            </>
          )}

          <div style={{ color: 'var(--border-color)' }}>|</div>

          <button
            onClick={checkHealth}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: 'var(--accent-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
            }}
            title="Refresh Status"
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>{loading ? 'Checking...' : 'Refresh'}</span>
          </button>
        </div>

        {lastChecked && (
          <div style={{ marginTop: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Last checked at {lastChecked} • Auto-refreshes every 30s
          </div>
        )}
      </div>

      {/* Services Breakdown */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
        Services & Subsystems
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
        {services.map((svc, idx) => (
          <div
            key={idx}
            className="card fade-in"
            style={{
              padding: '1.15rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  display: 'flex',
                }}
              >
                {svc.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 600, margin: 0 }}>{svc.name}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}>
                  {svc.description}
                </p>
              </div>
            </div>

            <span
              className="badge"
              style={{
                backgroundColor:
                  svc.status === 'Operational'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                color:
                  svc.status === 'Operational'
                    ? 'var(--color-success)'
                    : 'var(--color-danger)',
                fontWeight: 600,
                fontSize: '0.78rem',
                flexShrink: 0,
              }}
            >
              {svc.status}
            </span>
          </div>
        ))}
      </div>

      {/* Raw JSON Toggle */}
      <div className="card fade-in" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Raw Endpoint Output (/api/health)</span>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowRaw(!showRaw)}
            style={{ fontSize: '0.8rem', padding: '0.25rem 0.65rem' }}
          >
            {showRaw ? 'Hide JSON' : 'Show JSON'}
          </button>
        </div>

        {showRaw && (
          <pre
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-elevated)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              overflowX: 'auto',
              border: '1px solid var(--border-color)',
            }}
          >
            {JSON.stringify(healthData || { error }, null, 2)}
          </pre>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          USOF Cloud Engine • Status Dashboard
        </span>
      </div>
    </div>
  );
};

export default StatusPage;

