import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLikePost } from '../../store/postsSlice';
import { addFavorite, removeFavorite } from '../../store/favoritesSlice';
import { subscribePost, unsubscribePost } from '../../store/subscriptionsSlice';
import { postsApi } from '../../api/postsApi';
import Avatar from '../common/Avatar';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bookmark,
  Share2,
  Calendar,
  Check,
  Bell,
  Eye,
  EyeOff,
} from 'lucide-react';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user, role, isAuthenticated } = useSelector((state) => state.auth || {});
  const { favoriteIds = [] } = useSelector((state) => state.favorites || {});
  const { subscribedPostIds = [] } = useSelector((state) => state.subscriptions || {});

  const [status, setStatus] = useState(post.status || 'active');
  const isAuthorOrAdmin = isAuthenticated && (user?.id === post.author_id || role === 'admin');

  useEffect(() => {
    setStatus(post.status || 'active');
  }, [post.status]);

  const override = useSelector((state) => state.posts?.likesByPostId?.[post.id]);

  const trackedPost = useSelector((state) => {
    return (
      state.posts?.items?.find((p) => p.id === post.id) ||
      (state.posts?.currentPost?.id === post.id ? state.posts.currentPost : null) ||
      state.favorites?.items?.find((p) => p.id === post.id) ||
      state.subscriptions?.items?.find((p) => p.id === post.id) ||
      null
    );
  });

  const userReaction =
    override !== undefined
      ? override.reaction
      : trackedPost?.user_reaction !== undefined
      ? trackedPost.user_reaction
      : trackedPost?.user_like !== undefined
      ? trackedPost.user_like
      : post.user_reaction !== undefined
      ? post.user_reaction
      : post.user_like || null;

  const userLikesCount =
    override !== undefined
      ? override.likes_count
      : trackedPost?.likes_count !== undefined
      ? parseInt(trackedPost.likes_count, 10)
      : parseInt(post.likes_count || 0, 10);

  const [copied, setCopied] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const isFavorited = favoriteIds.includes(post.id);
  const isSubscribed = subscribedPostIds.includes(post.id);

  const authorAvatar = post.author_avatar
    ? post.author_avatar.startsWith('/uploads')
      ? post.author_avatar
      : `/uploads/${post.author_avatar}`
    : '/uploads/default-avatar.png';

  const categories = post.category_titles ? post.category_titles.split(',') : [];

  const handleLike = async (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please log in to like posts.');

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

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please log in to bookmark posts.');

    if (isFavorited) {
      dispatch(removeFavorite(post.id));
    } else {
      dispatch(addFavorite(post.id));
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please log in to subscribe to posts.');

    setSubLoading(true);
    try {
      if (isSubscribed) {
        await dispatch(unsubscribePost(post.id)).unwrap();
      } else {
        await dispatch(subscribePost(post.id)).unwrap();
      }
    } catch (err) {
      alert(err || 'Failed to update subscription');
    } finally {
      setSubLoading(false);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${post.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextStatus = status === 'active' ? 'inactive' : 'active';
    try {
      await postsApi.updatePostStatus(post.id, nextStatus);
      setStatus(nextStatus);
    } catch (err) {
      alert(err.message || 'Failed to update post status.');
    }
  };

  return (
    <article className="card fade-in" style={{ marginBottom: '1rem', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Left Side: Vote Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '0.35rem',
            paddingRight: '0.75rem',
            borderRight: '1px solid var(--border-color)',
            minWidth: '55px',
          }}
        >
          <button
            className="btn-icon"
            onClick={(e) => handleLike(e, 'like')}
            title="Upvote"
            style={{ color: userReaction === 'like' ? 'var(--color-success)' : 'inherit' }}
          >
            <ThumbsUp size={18} fill={userReaction === 'like' ? 'currentColor' : 'none'} />
          </button>

          <span
            style={{
              fontWeight: 700,
              fontSize: '1rem',
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
            onClick={(e) => handleLike(e, 'dislike')}
            title="Downvote"
            style={{ color: userReaction === 'dislike' ? 'var(--color-danger)' : 'inherit' }}
          >
            <ThumbsDown size={18} fill={userReaction === 'dislike' ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Right Side: Content Box */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Post Header: Status & Categories */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginBottom: '0.4rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {status === 'inactive' && (
                <span className="badge badge-inactive">Hidden / Draft</span>
              )}
              {categories.map((cat, idx) => (
                <span key={idx} className="badge badge-primary">
                  {cat.trim()}
                </span>
              ))}
            </div>

            {/* Quick Actions (Status toggle, Subscribe, Bookmark & Share) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {isAuthorOrAdmin && (
                <button
                  className="btn-icon"
                  onClick={handleToggleStatus}
                  title={status === 'active' ? 'Hide question (Draft)' : 'Publish question'}
                  style={{
                    color: status === 'inactive' ? 'var(--color-warning)' : 'inherit',
                  }}
                >
                  {status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}

              <button
                className="btn-icon"
                onClick={handleSubscribe}
                disabled={subLoading}
                title={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                style={{
                  color: isSubscribed ? 'var(--accent-primary, #6366F1)' : 'inherit',
                  opacity: subLoading ? 0.6 : 1,
                }}
              >
                <Bell size={16} fill={isSubscribed ? 'currentColor' : 'none'} />
              </button>

              <button
                className="btn-icon"
                onClick={handleFavorite}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                style={{ color: isFavorited ? 'var(--color-warning)' : 'inherit' }}
              >
                <Bookmark size={16} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>

              <button
                className="btn-icon"
                onClick={handleShare}
                title="Copy share link"
                style={{ color: copied ? 'var(--color-success)' : 'inherit' }}
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Link
              to={`/posts/${post.id}`}
              style={{ color: 'var(--text-primary)', transition: 'color var(--transition-fast)' }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-primary)')}
            >
              {post.title}
            </Link>
          </h2>

          {/* Content Preview */}
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.85rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.content}
          </p>

          {/* Footer Metadata */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '0.65rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <Link
              to={`/users/${post.author_id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
            >
              <Avatar src={post.author_avatar} name={post.author_login} size={24} />
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {post.author_login}
              </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} />
              <span>{new Date(post.publish_date).toLocaleDateString()}</span>
            </div>

            <Link
              to={`/posts/${post.id}#comments`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent-primary)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <span>Discussion</span>
              <MessageSquare size={14} />
              <span
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: '999px',
                  padding: '0.1rem 0.45rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {post.comments_count || 0}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
