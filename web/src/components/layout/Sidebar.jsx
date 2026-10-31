import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  MessageSquare,
  Tag,
  Star,
  BarChart2,
  User,
  PlusCircle,
  Bell,
  Lightbulb,
  X,
} from 'lucide-react';
import '../../styles/layout.css';

const Sidebar = ({ onOpenCreateModal, isOpen = false, onClose }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Mobile-only header inside drawer */}
        <div className="sidebar-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
            <img src="/logo.png" alt="USOF Logo" style={{ height: '26px', width: 'auto' }} />
            <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>USOF Navigation</span>
          </div>
          <button
            type="button"
            className="btn btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Create Post Action */}
        {isAuthenticated && (
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '0.5rem' }}
            onClick={() => {
              if (onClose) onClose();
              onOpenCreateModal();
            }}
          >
            <PlusCircle size={18} />
            <span>Ask Question</span>
          </button>
        )}

        {/* Main Navigation Links */}
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
            end
          >
            <MessageSquare size={18} />
            <span>Questions & Feed</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <Tag size={18} />
            <span>Categories</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/subscriptions"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <Bell size={18} />
              <span>Subscriptions</span>
            </NavLink>
          )}

          {isAuthenticated && (
            <NavLink
              to="/favorites"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <Star size={18} />
              <span>Favorites</span>
            </NavLink>
          )}

          <NavLink
            to="/stats"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <BarChart2 size={18} />
            <span>Platform Stats</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/profile"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <User size={18} />
              <span>My Profile</span>
            </NavLink>
          )}
        </nav>

        {/* Community Tip Card (Hidden on mobile phones and small screens) */}
        <div className="card sidebar-tip-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.3rem' }}>
            <Lightbulb size={16} />
            <span>Pro Tip</span>
          </div>
          Search questions with tags or filter by rating to discover expert solutions.
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
