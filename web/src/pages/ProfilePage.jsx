import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateAvatar, checkAuth, setUser } from '../store/authSlice';
import { userApi } from '../api/extraApis';
import { postsApi } from '../api/postsApi';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/common/Avatar';
import Pagination from '../components/common/Pagination';
import {
  User,
  Mail,
  Shield,
  Star,
  Camera,
  Edit2,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  LogIn,
} from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user: currentUser, role: currentRole, isAuthenticated } = useSelector((state) => state.auth);
  const { id: paramId } = useParams();

  const targetUserId = paramId ? parseInt(paramId, 10) : currentUser?.id;
  const isOwner = currentUser && targetUserId === currentUser.id;
  const isAdmin = currentRole === 'admin';
  const canEdit = isOwner || isAdmin;

  const [profileUser, setProfileUser] = useState(isOwner ? currentUser : null);
  const [loadingUser, setLoadingUser] = useState(!isOwner);
  const [userError, setUserError] = useState(null);

  const [login, setLogin] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);
  const [infoError, setInfoError] = useState(null);

  const [avatarLoading, setAvatarLoading] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsPage, setPostsPage] = useState(1);
  const postsPageSize = 10;

  useEffect(() => {
    if (!isAuthenticated || !targetUserId) return;
    setPostsPage(1);

    setLoadingUser(true);
    setUserError(null);
    userApi
      .getUserById(targetUserId)
      .then((res) => {
        const u = res.user;
        setProfileUser(u);
        setLogin(u.login || '');
        setFullName(u.full_name || '');
        setEmail(u.email || '');
        if (isOwner) {
          dispatch(setUser(u));
        }
      })
      .catch((err) => {
        setUserError(err.message || 'User not found.');
      })
      .finally(() => setLoadingUser(false));
  }, [isAuthenticated, targetUserId, isOwner, dispatch]);

  useEffect(() => {
    if (!isAuthenticated || !targetUserId) return;

    setPostsLoading(true);
    postsApi
      .getPosts({ author_id: targetUserId, limit: 50 })
      .then((res) => {
        const posts = res.posts || [];
        setUserPosts(posts);
      })
      .catch(() => {
        setUserPosts([]);
      })
      .finally(() => setPostsLoading(false));
  }, [isAuthenticated, targetUserId]);

  if (!isAuthenticated) {
    return (
      <div className="card fade-in" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: '1rem',
            borderRadius: '50%',
            background: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            marginBottom: '1rem',
          }}
        >
          <LogIn size={32} />
        </div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Authentication Required
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
          User profiles and activity statistics are only accessible to registered community members.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-outline">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (loadingUser) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading user profile...
      </div>
    );
  }

  if (userError || !profileUser) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-danger)' }}>
        <AlertCircle size={28} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
        <h3>{userError || 'User not found.'}</h3>
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Discussions
        </Link>
      </div>
    );
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    try {
      const res = await userApi.uploadAvatar(formData, targetUserId);
      const newPic = res.profile_picture;
      setProfileUser((prev) => (prev ? { ...prev, profile_picture: newPic } : prev));
      if (isOwner) {
        dispatch(checkAuth());
      }
    } catch (err) {
      alert(err.message || err || 'Failed to update avatar.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!login.trim()) {
      setInfoError('Username (login) cannot be empty.');
      return;
    }
    setUpdatingInfo(true);
    setInfoMessage(null);
    setInfoError(null);
    try {
      const payload = {
        login: login.trim(),
        full_name: fullName.trim(),
      };
      if (isOwner && email && email.trim()) {
        payload.email = email.trim();
      }

      const res = await userApi.updateUser(targetUserId, payload);
      setInfoMessage('Profile details updated successfully!');
      setIsEditingInfo(false);

      if (res?.user) {
        setProfileUser(res.user);
        if (isOwner) {
          dispatch(setUser(res.user));
          dispatch(checkAuth());
        }
      }
    } catch (err) {
      setInfoError(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingInfo(false);
    }
  };

  return (
    <div>
      {/* Profile Overview Card */}
      <div className="card fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar (with upload icon if owner) */}
          <div style={{ position: 'relative' }}>
            <Avatar
              src={profileUser.profile_picture}
              name={profileUser.login || profileUser.full_name || 'User'}
              size={90}
              style={{
                border: '3px solid var(--accent-primary)',
              }}
            />
            {canEdit && (
              <>
                <button
                  className="btn btn-primary"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    padding: 0,
                  }}
                  title={isOwner ? "Upload new avatar" : "Upload avatar for user (Admin)"}
                  onClick={() => document.getElementById('avatar-file-input').click()}
                  disabled={avatarLoading}
                >
                  <Camera size={16} />
                </button>
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          {/* User Meta Information */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>
                {profileUser.full_name || profileUser.login}
              </h1>
              <span className={`badge badge-${(profileUser.role || 'user').toLowerCase()}`}>
                {(profileUser.role || 'USER').toUpperCase()}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={15} color="var(--text-muted)" />
                <span>@{profileUser.login}</span>
              </div>

              {/* Email is ONLY shown for the profile owner or for admin */}
              {(isOwner || isAdmin) && profileUser.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={15} color="var(--text-muted)" />
                  <span>{profileUser.email}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--color-warning)',
                  fontWeight: 600,
                }}
              >
                <Star size={15} fill="currentColor" />
                <span>Rating: {profileUser.rating || 0}</span>
              </div>

              {profileUser.created_at && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} color="var(--text-muted)" />
                  <span>Joined {new Date(profileUser.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button: available to owner or admin */}
          {canEdit && (
            <div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsEditingInfo(!isEditingInfo)}
              >
                <Edit2 size={15} />
                <span>
                  {isEditingInfo
                    ? 'Cancel Edit'
                    : isOwner
                    ? 'Edit Profile'
                    : 'Edit User (Admin)'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {isEditingInfo && canEdit && (
          <form
            onSubmit={handleSaveInfo}
            style={{
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {infoError && (
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={15} />
                <span>{infoError}</span>
              </div>
            )}
            {infoMessage && (
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-success-bg)',
                  color: 'var(--color-success)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Check size={15} />
                <span>{infoMessage}</span>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div className="form-group">
                <label className="form-label">Username (Login)</label>
                <input
                  type="text"
                  className="form-input"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              {isOwner && (
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-sm" disabled={updatingInfo}>
              {updatingInfo ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        )}
      </div>

      {/* User's Created Posts Section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileText size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {isOwner ? 'My Questions & Posts' : `Questions by @${profileUser.login}`} ({userPosts.length})
          </h2>
        </div>

        {postsLoading ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Loading publications...
          </div>
        ) : userPosts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            {isOwner
              ? "You haven't posted any questions yet. Use the \"Ask Question\" button to start!"
              : `@${profileUser.login} hasn't published any questions yet.`}
          </div>
        ) : (
          <>
            {userPosts
              .slice((postsPage - 1) * postsPageSize, postsPage * postsPageSize)
              .map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

            <Pagination
              currentPage={postsPage}
              totalPages={Math.ceil(userPosts.length / postsPageSize) || 1}
              totalItems={userPosts.length}
              onPageChange={setPostsPage}
              itemName="posts"
            />
          </>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
