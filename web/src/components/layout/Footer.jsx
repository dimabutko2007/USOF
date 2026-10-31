import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Code2, Activity } from 'lucide-react';
import '../../styles/layout.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src="/logo.png"
            alt="USOF Logo"
            style={{
              height: '24px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12))',
            }}
          />
          <span>
            <strong>USOF</strong> — User StackOverflow Community Platform
          </span>
        </div>

        <div className="footer-links">
          <Link to="/status" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Activity size={14} color="var(--color-success)" />
            <span>API Status: Healthy</span>
          </Link>
          <Link to="/guidelines">Guidelines</Link>
          <Link to="/privacy">Privacy</Link>
          <a href="https://github.com/dimabutko2007/USOF" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Code2 size={14} />
            <span>Source Code</span>
          </a>
        </div>

        <div>
          <span>Crafted with <Heart size={14} style={{ display: 'inline', color: 'var(--color-danger)' }} /> for Developers © 2026</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
