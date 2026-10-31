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
  HelpCircle,
  Bell,
} from 'lucide-react';
import '../../styles/layout.css';

const Sidebar = ({ onOpenCreateModal }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <aside className="sidebar">
      {/* Create Post Action */}
      {isAuthenticated && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '0.5rem' }}
          onClick={onOpenCreateModal}
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
          end
        >
          <MessageSquare size={18} />
          <span>Questions & Feed</span>
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Tag size={18} />
          <span>Categories</span>
        </NavLink>

        {isAuthenticated && (
          <NavLink
            to="/subscriptions"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Bell size={18} />
            <span>Subscriptions</span>
          </NavLink>
        )}

        {isAuthenticated && (
          <NavLink
            to="/favorites"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Star size={18} />
            <span>Favorites</span>
          </NavLink>
        )}

        <NavLink
          to="/stats"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <BarChart2 size={18} />
          <span>Platform Stats</span>
        </NavLink>

        {isAuthenticated && (
          <NavLink
            to="/profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <User size={18} />
            <span>My Profile</span>
          </NavLink>
        )}
      </nav>

      {/* Community Tip Card */}
      <div
        className="card"
        style={{
          marginTop: 'auto',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.3rem' }}>
          <HelpCircle size={16} />
          <span>Pro Tip</span>
        </div>
        Search questions with tags or filter by rating to discover expert solutions.
      </div>
    </aside>
  );
};

export default Sidebar;

