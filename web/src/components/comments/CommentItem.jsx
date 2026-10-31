import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Avatar from '../common/Avatar';
import {
  toggleCommentLike,
  updateCommentStatus,
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
} from 'lucide-react';

const CommentItem = ({ comment, postId, childrenComments = [] }) => {
  const dispatch = useDispatch();
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);

  const [likesCount, setLikesCount] = useState(parseInt(comment.likes_count || 0, 10));
  const [reaction, setReaction] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const isAuthorOrAdmin = isAuthenticated && (user?.id === comment.author_id || role === 'admin');

  // Avatar URL resolver
  const authorAvatar = comment.author_avatar
    ? comment.author_avatar.startsWith('/uploads')
      ? comment.author_avatar
      : `/uploads/${comment.author_avatar}`
    : '/uploads/default-avatar.png';

  const handleLike = (type) => {
    if (!isAuthenticated) return alert('Please log in to react to comments.');
    const newReaction = reaction === type ? null : type;
    const diff = newReaction === 'like' ? (reaction === 'dislike' ? 2 : 1) : newReaction === 'dislike' ? (reaction === 'like' ? -2 : -1) : reaction === 'like' ? -1 : 1;
    setReaction(newReaction);
    setLikesCount((prev) => prev + diff);
    dispatch(toggleCommentLike({ commentId: comment.id, type }));
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
            <Avatar src={comment.author_avatar} name={comment.author_login} size={26} />
            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{comment.author_login}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(comment.publish_date).toLocaleString()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {comment.status === 'inactive' && (
              <span className="badge badge-inactive">Inactive / Moderated</span>
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

        {/* Comment Body */}
        <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: '0.65rem' }}>
          {comment.content}
        </p>

        {/* Comment Actions (Likes + Reply button) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem' }}>
          {/* Reaction up/down */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              className="btn-icon"
              style={{ padding: '0.25rem', color: reaction === 'like' ? 'var(--color-success)' : 'inherit' }}
              onClick={() => handleLike('like')}
            >
              <ThumbsUp size={15} />
            </button>
            <span style={{ fontWeight: 600 }}>{likesCount}</span>
            <button
              className="btn-icon"
              style={{ padding: '0.25rem', color: reaction === 'dislike' ? 'var(--color-danger)' : 'inherit' }}
              onClick={() => handleLike('dislike')}
            >
              <ThumbsDown size={15} />
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

