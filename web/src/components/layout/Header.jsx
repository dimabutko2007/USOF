import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import { setFilter } from '../../store/postsSlice';
import { markNotificationRead } from '../../store/notificationSlice';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  LogOut,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Bell,
  Shield,
  User as UserIcon,
  Menu,
  X,
} from 'lucide-react';
import '../../styles/layout.css';
import Avatar from '../common/Avatar';

const Header = ({ isMobileNavOpen = false, toggleMobileNav }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const { user, role, isAuthenticated } = useSelector((state) => state.auth);
  const { filters } = useSelector((state) => state.posts);
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications);

  const [showNotifs, setShowNotifs] = useState(false);

  const handleSearchChange = (e) => {
    dispatch(setFilter({ search: e.target.value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Left Section: Mobile Menu Toggle + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-icon mobile-menu-btn"
            onClick={toggleMobileNav}
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
          >
            {isMobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="USOF Logo" className="header-logo-img" />
            <span>USOF</span>
            <span className="header-logo-badge">DEV</span>
          </Link>
        </div>

        {/* Desktop Search Bar (Hidden on mobile via CSS) */}
        <form className="header-search header-search-desktop" onSubmit={handleSearchSubmit}>
          <Search size={18} className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search questions, tags, topics..."
            value={filters.search}
            onChange={handleSearchChange}
          />
          {filters.search && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => dispatch(setFilter({ search: '' }))}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Role Badge */}
          <div className={`badge badge-${role.toLowerCase()} header-role-badge`}>
            {role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
            <span className="header-role-text">{role.toUpperCase()}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            className="btn btn-icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Notifications Dropdown (Authenticated Users) */}
          {isAuthenticated && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-icon"
                onClick={() => setShowNotifs(!showNotifs)}
                title="Notifications"
                style={{ position: 'relative' }}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: 'var(--color-danger)',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="notif-popover">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                    <span>Notifications</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {unreadCount} unread
                    </span>
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                          onClick={() => dispatch(markNotificationRead(n.id))}
                        >
                          <div>{n.message}</div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile or Guest Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Link to="/profile" className="user-profile-badge" title="View Profile">
                <Avatar src={user?.profile_picture} name={user?.login || 'User'} size={26} />
                <div className="user-info-text header-user-text">
                  <span className="user-name">{user?.login}</span>
                </div>
              </Link>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
                title="Log out from platform"
              >
                <LogOut size={16} />
                <span className="header-btn-label">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="user-profile-badge header-guest-badge" style={{ cursor: 'default' }}>
                <Avatar isGuest name="Guest" size={26} />
                <div className="user-info-text header-user-text">
                  <span className="user-name" style={{ color: 'var(--text-muted)' }}>
                    Guest
                  </span>
                </div>
              </div>
              <Link to="/login" className="btn btn-secondary btn-sm" title="Log In">
                <LogIn size={15} />
                <span className="header-btn-label">Log In</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" title="Sign Up">
                <UserPlus size={15} />
                <span className="header-btn-label">Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Panel: transferred from top cramped header to its own dedicated panel */}
      <div className="header-mobile-search-panel">
        <form className="header-search-form-mobile" onSubmit={handleSearchSubmit}>
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            className="header-search-input-mobile"
            placeholder="Search questions, tags, topics..."
            value={filters.search}
            onChange={handleSearchChange}
          />
          {filters.search && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => dispatch(setFilter({ search: '' }))}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>
    </header>
  );
};

export default Header;

