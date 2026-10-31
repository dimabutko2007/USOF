import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Avatar from '../common/Avatar';
import {
  toggleCommentLike,
  updateCommentStatus,
  updateComment,
  deleteComment,
  addComment,
} from '../../store/commentsSlice';
import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  Trash2,
  Eye,
  EyeOff,
  CornerDownRight,
  Send,
  Edit2,
} from 'lucide-react';

const CommentItem = ({ comment, postId, childrenComments = [] }) => {
  const dispatch = useDispatch();
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);

  const [likesCount, setLikesCount] = useState(parseInt(comment.likes_count || 0, 10));
  const [reaction, setReaction] = useState(comment.user_reaction || null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Edit comment state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || '');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    setLikesCount(parseInt(comment.likes_count || 0, 10));
    setReaction(comment.user_reaction || null);
    setEditText(comment.content || '');
  }, [comment.likes_count, comment.user_reaction, comment.content]);

  const isAuthor = isAuthenticated && user?.id === comment.author_id;
  const isAuthorOrAdmin = isAuthenticated && (user?.id === comment.author_id || role === 'admin');

  // Avatar URL resolver
  const authorAvatar = comment.author_avatar
    ? comment.author_avatar.startsWith('/uploads')
      ? comment.author_avatar
      : `/uploads/${comment.author_avatar}`
    : '/uploads/default-avatar.png';

  const handleLike = async (type) => {
    if (!isAuthenticated) return alert('Please log in to react to comments.');
    const nextReaction = reaction === type ? null : type;
    const prevScore = reaction === 'like' ? 1 : reaction === 'dislike' ? -1 : 0;
    const nextScore = nextReaction === 'like' ? 1 : nextReaction === 'dislike' ? -1 : 0;
    const diff = nextScore - prevScore;

    setReaction(nextReaction);
    setLikesCount((prev) => prev + diff);

    try {
      await dispatch(
        toggleCommentLike({
          commentId: comment.id,
          type,
          currentReaction: reaction,
          currentLikesCount: likesCount,
        })
      ).unwrap();
    } catch (err) {
      setReaction(reaction);
      setLikesCount((prev) => prev - diff);
      alert(err || 'Failed to update comment reaction');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return alert('Comment cannot be empty.');

    setSubmittingEdit(true);
    try {
      await dispatch(
        updateComment({
          commentId: comment.id,
          content: editText.trim(),
        })
      ).unwrap();
      setIsEditing(false);
    } catch (err) {
      alert(err || 'Failed to update comment.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleStatus = () => {
    const nextStatus = comment.status === 'active' ? 'inactive' : 'active';
    dispatch(updateCommentStatus({ commentId: comment.id, status: nextStatus }));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment(comment.id));
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmittingReply(true);
    try {
      await dispatch(
        addComment({
          postId,
          content: replyText.trim(),
          parent_id: comment.id,
        })
      ).unwrap();
      setReplyText('');
      setIsReplying(false);
    } catch (err) {
      alert(err || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div
      style={{
        marginTop: '0.85rem',
        borderLeft: comment.parent_id ? '2px solid var(--border-color-light)' : 'none',
        paddingLeft: comment.parent_id ? '1rem' : '0',
      }}
    >
      <div
        className="card"
        style={{
          background: comment.status === 'inactive' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card)',
          borderColor: comment.status === 'inactive' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)',
          padding: '1rem',
        }}
      >
        {/* Comment Header: Author & Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link
              to={`/users/${comment.author_id}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}
            >
              <Avatar src={comment.author_avatar} name={comment.author_login} size={26} />
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{comment.author_login}</span>
            </Link>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(comment.publish_date).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {comment.status === 'inactive' && (
              <span className="badge badge-inactive">Inactive / Moderated</span>
            )}
            {/* Edit comment: ONLY comment author can edit, admin cannot edit other's comment */}
            {isAuthor && (
              <button
                className="btn-icon btn-sm"
                onClick={() => setIsEditing(!isEditing)}
                title={isEditing ? 'Cancel Edit' : 'Edit Comment'}
                style={{ color: isEditing ? 'var(--accent-primary)' : 'inherit' }}
              >
                <Edit2 size={15} />
              </button>
            )}
            {isAuthorOrAdmin && (
              <>
                <button
                  className="btn-icon btn-sm"
                  onClick={handleToggleStatus}
                  title={comment.status === 'active' ? 'Mark Inactive' : 'Mark Active'}
                >
                  {comment.status === 'active' ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  className="btn-icon btn-sm"
                  onClick={handleDelete}
                  title="Delete Comment"
                  style={{ color: 'var(--color-danger)' }}
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Comment Body or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} style={{ marginBottom: '0.75rem', marginTop: '0.25rem' }}>
            <textarea
              className="form-textarea"
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              required
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditText(comment.content || '');
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingEdit || !editText.trim()}
              >
                {submittingEdit ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: '0.65rem' }}>
            {comment.content}
          </p>
        )}

        {/* Comment Actions (Likes + Reply button) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem' }}>
          {/* Reaction up/down */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              className="btn-icon"
              style={{ padding: '0.25rem', color: reaction === 'like' ? 'var(--color-success)' : 'inherit' }}
              onClick={() => handleLike('like')}
              title="Like comment"
            >
              <ThumbsUp size={15} fill={reaction === 'like' ? 'currentColor' : 'none'} />
            </button>
            <span style={{ fontWeight: 600 }}>{likesCount}</span>
            <button
              className="btn-icon"
              style={{ padding: '0.25rem', color: reaction === 'dislike' ? 'var(--color-danger)' : 'inherit' }}
              onClick={() => handleLike('dislike')}
              title="Dislike comment"
            >
              <ThumbsDown size={15} fill={reaction === 'dislike' ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Reply Button */}
          {isAuthenticated && (
            <button
              className="btn btn-outline btn-sm"
              style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply size={13} />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Nested Reply Form */}
        {isReplying && (
          <form onSubmit={handleSendReply} style={{ marginTop: '0.85rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CornerDownRight size={16} color="var(--accent-primary)" style={{ marginTop: '0.6rem' }} />
              <textarea
                className="form-textarea"
                rows={2}
                placeholder={`Replying to @${comment.author_login}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={submittingReply || !replyText.trim()}
              >
                <Send size={13} />
                <span>{submittingReply ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Render Nested Children Replies recursively */}
      {childrenComments.length > 0 && (
        <div style={{ marginLeft: '1rem' }}>
          {childrenComments.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              postId={postId}
              childrenComments={child.children || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;

