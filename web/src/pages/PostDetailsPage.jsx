import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPostById, toggleLikePost } from '../store/postsSlice';
import { addFavorite, removeFavorite } from '../store/favoritesSlice';
import { subscribePost, unsubscribePost } from '../store/subscriptionsSlice';
import { fetchComments } from '../store/commentsSlice';
import { postsApi } from '../api/postsApi';
import { categoriesApi } from '../api/extraApis';
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
  Tag,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  Eye,
  EyeOff,
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
  const [editCategories, setEditCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [editExistingImages, setEditExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [editError, setEditError] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    categoriesApi
      .getCategories()
      .then((res) => setAvailableCategories(res.categories || []))
      .catch(() => {});
  }, []);

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
      const catIds = (post.categories || []).map((c) =>
        typeof c === 'object' ? c.id : parseInt(c, 10)
      );
      setEditCategories(catIds);
      setEditExistingImages(post.images || []);
      setNewFiles([]);
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

  const handleToggleCategory = (catId) => {
    setEditError(null);
    if (editCategories.includes(catId)) {
      if (editCategories.length === 1) {
        setEditError('A question must have at least one topic tag.');
        return;
      }
      setEditCategories((prev) => prev.filter((cId) => cId !== catId));
    } else {
      setEditCategories((prev) => [...prev, catId]);
    }
  };

  const handleRemoveExistingImage = (imgSrc) => {
    setEditExistingImages((prev) => prev.filter((img) => img !== imgSrc));
  };

  const handleAddNewFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const total = editExistingImages.length + newFiles.length + files.length;
      if (total > 5) {
        setEditError('You can attach a maximum of 5 images per question.');
        return;
      }
      setNewFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    setEditError(null);

    if (!editTitle.trim()) {
      setEditError('Question title cannot be empty.');
      return;
    }
    if (editTitle.trim().length < 5) {
      setEditError('Question title must be at least 5 characters.');
      return;
    }
    if (!editContent.trim()) {
      setEditError('Question content cannot be empty.');
      return;
    }
    if (editCategories.length === 0) {
      setEditError('Please select at least one topic tag for your question.');
      return;
    }

    setSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('content', editContent.trim());
      formData.append('categories', JSON.stringify(editCategories));
      formData.append('existingImages', JSON.stringify(editExistingImages));
      for (let i = 0; i < newFiles.length; i++) {
        formData.append('images', newFiles[i]);
      }

      await postsApi.updatePost(post.id, formData);
      setIsEditing(false);
      dispatch(fetchPostById(post.id));
    } catch (err) {
      setEditError(err.message || 'Failed to update question');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
    if (post) {
      setEditTitle(post.title || '');
      setEditContent(post.content || '');
      const catIds = (post.categories || []).map((c) =>
        typeof c === 'object' ? c.id : parseInt(c, 10)
      );
      setEditCategories(catIds);
      setEditExistingImages(post.images || []);
      setNewFiles([]);
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
        {isEditing ? (
          /* UNIFIED EDIT FORM */
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Edit Question</h2>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Editing question #{post.id}
              </span>
            </div>

            {editError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-danger-bg)',
                  color: 'var(--color-danger)',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{editError}</span>
              </div>
            )}

            {/* Title Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Question Title</label>
              <input
                type="text"
                className="form-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="What is your programming question?"
                required
              />
            </div>

            {/* Topic Tags / Categories Selection */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                  Tags / Categories <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <span style={{ fontSize: '0.8rem', color: editCategories.length === 0 ? 'var(--color-danger)' : 'var(--text-secondary)' }}>
                  {editCategories.length} selected (min. 1 required)
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableCategories.map((cat) => {
                  const isSelected = editCategories.includes(cat.id);
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      className={`badge ${isSelected ? 'badge-primary' : ''}`}
                      style={{
                        cursor: 'pointer',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        opacity: isSelected ? 1 : 0.65,
                        transition: 'all var(--transition-fast)',
                      }}
                      onClick={() => handleToggleCategory(cat.id)}
                      title={isSelected ? 'Click to deselect tag' : 'Click to add tag'}
                    >
                      <span>{cat.title}</span>
                      {isSelected ? <Check size={13} /> : <Tag size={13} />}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Click a tag to add or remove it from your question. At least one tag must remain.
              </p>
            </div>

            {/* Content Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Question Details & Code</label>
              <textarea
                className="form-textarea"
                rows={10}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Include details about your problem, code snippets, and expected results..."
                required
              />
            </div>

            {/* Attached Screenshots & Images Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={16} color="var(--accent-primary)" />
                  <span>Attached Screenshots & Images</span>
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {editExistingImages.length + newFiles.length} of 5 max
                </span>
              </div>

              {/* Thumbnails list */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {/* Existing Images */}
                {editExistingImages.map((imgSrc, idx) => (
                  <div
                    key={`existing-${idx}`}
                    style={{
                      position: 'relative',
                      width: '120px',
                      height: '85px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <img
                      src={imgSrc}
                      alt={`Attached ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(imgSrc)}
                      title="Remove image"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={13} />
                    </button>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '4px',
                        fontSize: '0.65rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: '#fff',
                        padding: '1px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      Current
                    </span>
                  </div>
                ))}

                {/* Newly Added Files Preview */}
                {newFiles.map((file, idx) => (
                  <div
                    key={`new-${idx}`}
                    style={{
                      position: 'relative',
                      width: '120px',
                      height: '85px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--accent-primary)',
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New upload ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewFile(idx)}
                      title="Remove image"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.85)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={13} />
                    </button>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '4px',
                        fontSize: '0.65rem',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#fff',
                        padding: '1px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      New
                    </span>
                  </div>
                ))}

                {/* Add Image Button */}
                {editExistingImages.length + newFiles.length < 5 && (
                  <label
                    style={{
                      width: '120px',
                      height: '85px',
                      borderRadius: 'var(--radius-sm)',
                      border: '2px dashed var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.color = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <Upload size={18} />
                    <span>Add Photo</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAddNewFiles}
                    />
                  </label>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Attach code screenshots, error messages, or diagrams (PNG, JPG, WebP). Max 5 images.
              </p>
            </div>

            {/* Single Action Buttons Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                <Check size={15} />
                <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCancelEdit}
                disabled={savingEdit}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR VIEW MODE */
          <>
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

                {/* Social Share Menu */}
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
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '1rem', lineHeight: 1.3 }}>
              {post.title}
            </h1>

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
              <Link
                to={`/users/${post.author_id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
              >
                <Avatar src={post.author_avatar} name={post.author_login} size={30} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {post.author_login}
                </span>
              </Link>

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

                {/* Attached Images Gallery */}
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

                {/* Author / Admin Management Toolbar (Only visible when NOT editing) */}
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
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={14} />
                      <span>Edit Question</span>
                    </button>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={handleTogglePostStatus}
                      title={post.status === 'active' ? 'Hide question (Draft)' : 'Publish question'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: post.status === 'inactive' ? 'var(--color-warning)' : 'inherit',
                      }}
                    >
                      {post.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{post.status === 'active' ? 'Hide (Draft)' : 'Publish'}</span>
                    </button>

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
          </>
        )}
      </article>

      {/* Discussion & Nested Comments Tree */}
      <CommentTree postId={post.id} />
    </div>
  );
};

export default PostDetailsPage;
