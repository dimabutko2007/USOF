import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPostById, toggleLikePost } from '../store/postsSlice';
import { addFavorite, removeFavorite } from '../store/favoritesSlice';
import { subscribePost, unsubscribePost } from '../store/subscriptionsSlice';
import { fetchComments } from '../store/commentsSlice';
import { postsApi } from '../api/postsApi';
import Avatar from '../components/common/Avatar';
import { fetchPostSubscription } from '../store/postsSlice';
import CommentTree from '../components/comments/CommentTree';
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Bell,
  BellOff,
  Edit3,
  Trash2,
  Calendar,
  ArrowLeft,
  Check,
  Send,
  Globe,
  MessageCircle,
} from 'lucide-react';

const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentPost: post, detailLoading: loading, error } = useSelector((state) => state.posts);
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);
  const { favoriteIds } = useSelector((state) => state.favorites);

  const isFavorited = post ? favoriteIds.includes(post.id) : false;

  const override = useSelector((state) => (post ? state.posts?.likesByPostId?.[post.id] : undefined));

  const userReaction =
    override !== undefined
      ? override.reaction
      : post?.user_reaction !== undefined
      ? post.user_reaction
      : post?.user_like || null;

  const userLikesCount =
    override !== undefined
      ? override.likes_count
      : parseInt(post?.likes_count || 0, 10);

  const isSubscribed = useSelector((state) =>
    post ? state.subscriptions?.subscribedPostIds?.includes(post.id) || false : false
  );

  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
      dispatch(fetchComments({ postId: id }));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (post) {
      setEditTitle(post.title || '');
      setEditContent(post.content || '');
    }
  }, [post]);

  if (loading || (!post && !error)) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        Loading question details...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>
          {error || 'Question not found or unavailable.'}
        </p>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Feed</span>
        </Link>
      </div>
    );
  }

  const isAuthorOrAdmin = isAuthenticated && (user?.id === post.author_id || role === 'admin');
  const isAdmin = role === 'admin';

  const authorAvatar = post.author_avatar
    ? post.author_avatar.startsWith('/uploads')
      ? post.author_avatar
      : `/uploads/${post.author_avatar}`
    : '/uploads/default-avatar.png';

  const categories = post.categories || [];

  const handleLike = async (type) => {
    if (!isAuthenticated) return alert('Please log in to vote.');
    try {
      await dispatch(
        toggleLikePost({
          postId: post.id,
          type,
          currentReaction: userReaction,
          currentLikesCount: userLikesCount,
        })
      ).unwrap();
    } catch (err) {
      alert(err || 'Failed to update reaction');
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) return alert('Please log in to save to favorites.');
    if (isFavorited) {
      dispatch(removeFavorite(post.id));
    } else {
      dispatch(addFavorite(post.id));
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) return alert('Please log in to subscribe to updates.');
    try {
      if (isSubscribed) {
        await dispatch(unsubscribePost(post.id)).unwrap();
      } else {
        await dispatch(subscribePost(post.id)).unwrap();
      }
    } catch (err) {
      alert(err || 'Failed to update subscription');
    }
  };

  const handleTogglePostStatus = async () => {
    const nextStatus = post.status === 'active' ? 'inactive' : 'active';
    try {
      await postsApi.updatePostStatus(post.id, nextStatus);
      dispatch(fetchPostById(post.id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await postsApi.deletePost(post.id);
        navigate('/');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await postsApi.updatePost(post.id, { title: editTitle, content: editContent });
      setIsEditing(false);
      dispatch(fetchPostById(post.id));
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Back Button */}
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Questions</span>
        </Link>
      </div>

      {/* Main Post Card */}
      <article className="card" style={{ padding: '1.75rem' }}>
        {/* Post Metadata Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {post.status === 'inactive' && (
              <span className="badge badge-inactive">Inactive / Locked</span>
            )}
            {categories.map((c) => (
              <span key={c.id} className="badge badge-primary">
                {c.title}
              </span>
            ))}
          </div>

          {/* Social Sharing & Bookmark Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={handleSubscribe}
              title={isSubscribed ? 'Unsubscribe from alerts' : 'Subscribe to email & in-app alerts'}
              style={{ color: isSubscribed ? 'var(--accent-primary)' : 'inherit' }}
            >
              {isSubscribed ? <BellOff size={15} /> : <Bell size={15} />}
              <span>{isSubscribed ? 'Subscribed' : 'Follow'}</span>
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={handleFavorite}
              title="Add to Favorites"
              style={{ color: isFavorited ? 'var(--color-warning)' : 'inherit' }}
            >
              <Bookmark size={15} fill={isFavorited ? 'currentColor' : 'none'} />
              <span>Save</span>
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowShareMenu(!showShareMenu)}
              title="Share question"
            >
              <Share2 size={15} />
              <span>Share</span>
            </button>

            {/* Social Share Menu (Creative Feature) */}
            {showShareMenu && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  zIndex: 100,
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  minWidth: '180px',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyLink}
                  style={{ justifyContent: 'flex-start' }}
                >
                  {copied ? <Check size={14} color="var(--color-success)" /> : <Share2 size={14} />}
                  <span>{copied ? 'Copied Link!' : 'Copy Direct Link'}</span>
                </button>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Send size={14} />
                  <span>Telegram</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Globe size={14} />
                  <span>Twitter / X</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <MessageCircle size={14} />
                  <span>Facebook</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Globe size={14} />
                  <span>LinkedIn</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Post Title */}
        {isEditing ? (
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>
        ) : (
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>
            {post.title}
          </h1>
        )}

        {/* Author & Timestamp Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Avatar src={post.author_avatar} name={post.author_login} size={30} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {post.author_login}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={15} />
            <span>Asked on {new Date(post.publish_date).toLocaleString()}</span>
          </div>
        </div>

        {/* Post Body with Side Voting Box */}
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {/* Vote Controls */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.45rem',
              paddingRight: '1rem',
              borderRight: '1px solid var(--border-color)',
            }}
          >
            <button
              className="btn-icon"
              onClick={() => handleLike('like')}
              title="Upvote"
              style={{ color: userReaction === 'like' ? 'var(--color-success)' : 'inherit' }}
            >
              <ThumbsUp size={22} fill={userReaction === 'like' ? 'currentColor' : 'none'} />
            </button>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color:
                  userLikesCount > 0
                    ? 'var(--color-success)'
                    : userLikesCount < 0
                    ? 'var(--color-danger)'
                    : 'var(--text-secondary)',
              }}
            >
              {userLikesCount}
            </span>
            <button
              className="btn-icon"
              onClick={() => handleLike('dislike')}
              title="Downvote"
              style={{ color: userReaction === 'dislike' ? 'var(--color-danger)' : 'inherit' }}
            >
              <ThumbsDown size={22} fill={userReaction === 'dislike' ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  rows={8}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '1.5rem',
                }}
              >
                {post.content}
              </div>
            )}

            {/* Attached Images Gallery (Creative feature) */}
            {post.images && post.images.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Attached Screenshots & Files ({post.images.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {post.images.map((imgSrc, idx) => (
                    <a
                      key={idx}
                      href={imgSrc}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'block',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={imgSrc}
                        alt={`Attachment ${idx + 1}`}
                        style={{ width: '140px', height: '100px', objectFit: 'cover' }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Author / Admin Management Toolbar */}
            {isAuthorOrAdmin && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 size={14} />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Question'}</span>
                </button>

                {isAdmin && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleTogglePostStatus}
                  >
                    <span>Toggle Status ({post.status === 'active' ? 'Lock' : 'Unlock'})</span>
                  </button>
                )}

                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDeletePost}
                >
                  <Trash2 size={14} />
                  <span>Delete Question</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Discussion & Nested Comments Tree */}
      <CommentTree postId={post.id} />
    </div>
  );
};

export default PostDetailsPage;
