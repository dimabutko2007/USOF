import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateAvatar, checkAuth } from '../store/authSlice';
import { userApi } from '../api/extraApis';
import { postsApi } from '../api/postsApi';
import PostCard from '../components/posts/PostCard';
import Avatar from '../components/common/Avatar';
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
} from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, role } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null);
  const [infoError, setInfoError] = useState(null);

  // Avatar upload
  const [avatarLoading, setAvatarLoading] = useState(false);

  // User's own posts
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');

      // Fetch user's own posts (all statuses)
      postsApi
        .getPosts({ page: 1, limit: 50 })
        .then((res) => {
          const allPosts = res.posts || [];
          const filtered = allPosts.filter((p) => p.author_id === user.id);
          setMyPosts(filtered);
        })
        .catch(() => {})
        .finally(() => setPostsLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        Please log in to view your profile.
      </div>
    );
  }

  const avatarSrc = user.profile_picture
    ? user.profile_picture.startsWith('/uploads')
      ? user.profile_picture
      : `/uploads/${user.profile_picture}`
    : '/uploads/default-avatar.png';

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    try {
      await dispatch(updateAvatar(formData)).unwrap();
      dispatch(checkAuth());
    } catch (err) {
      alert(err || 'Failed to update avatar.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setUpdatingInfo(true);
    setInfoMessage(null);
    setInfoError(null);
    try {
      await userApi.updateUser(user.id, { full_name: fullName, email });
      setInfoMessage('Profile details updated successfully!');
      setIsEditingInfo(false);
      dispatch(checkAuth());
    } catch (err) {
      setInfoError(err.message);
    } finally {
      setUpdatingInfo(false);
    }
  };

  return (
    <div>
      {/* Profile Overview Card */}
      <div className="card fade-in" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar with Upload Badge */}
          <div style={{ position: 'relative' }}>
            <Avatar
              src={user.profile_picture}
              name={user.login || user.full_name || 'User'}
              size={90}
              style={{
                border: '3px solid var(--accent-primary)',
              }}
            />
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
              title="Upload new avatar"
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
          </div>

          {/* User Meta Information */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>{user.full_name || user.login}</h1>
              <span className={`badge badge-${role.toLowerCase()}`}>{role.toUpperCase()}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={15} color="var(--text-muted)" />
                <span>@{user.login}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={15} color="var(--text-muted)" />
                <span>{user.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                <Star size={15} fill="currentColor" />
                <span>Rating: {user.rating || 0}</span>
              </div>
            </div>
          </div>

          <div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setIsEditingInfo(!isEditingInfo)}
            >
              <Edit2 size={15} />
              <span>{isEditingInfo ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditingInfo && (
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
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
            My Questions & Posts ({myPosts.length})
          </h2>
        </div>

        {postsLoading ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Loading your publications...
          </div>
        ) : myPosts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            You haven't posted any questions yet. Use the "Ask Question" button to start!
          </div>
        ) : (
          myPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
    </div>
  );
};

export default ProfilePage;

