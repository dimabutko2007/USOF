import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addComment, setCommentSort, fetchComments } from '../../store/commentsSlice';
import CommentItem from './CommentItem';
import { MessageSquare, ArrowUpDown, Send } from 'lucide-react';

const CommentTree = ({ postId }) => {
  const dispatch = useDispatch();
  const { items: comments, loading, sortBy } = useSelector((state) => state.comments);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const buildTree = (list) => {
    const map = {};
    const roots = [];

    list.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    list.forEach((item) => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  const tree = buildTree(comments);

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    dispatch(setCommentSort(newSort));
    dispatch(fetchComments({ postId, sort: newSort }));
  };

  const handleAddRootComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmitting(true);
    try {
      await dispatch(
        addComment({
          postId,
          content: newCommentText.trim(),
          parent_id: null,
        })
      ).unwrap();
      setNewCommentText('');
    } catch (err) {
      alert(err || 'Failed to submit comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="comments" style={{ marginTop: '2rem' }}>
      {/* Header and Sorting */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
            Answers & Discussion ({comments.length})
          </h3>
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={15} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="likes_asc">Likes (Low to High - Default)</option>
            <option value="likes_desc">Likes (High to Low)</option>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Root Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleAddRootComment} className="card" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: '0.4rem', display: 'block' }}>
            Write an Answer or Comment
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Share your technical knowledge or suggest a solution..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !newCommentText.trim()}
            >
              <Send size={15} />
              <span>{submitting ? 'Posting...' : 'Post Answer'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          Please <a href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>log in</a> to answer or comment on this post.
        </div>
      )}

      {/* Render Tree */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
          Loading discussion thread...
        </p>
      ) : tree.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          No answers or comments yet. Be the first to solve this question!
        </div>
      ) : (
        <div>
          {tree.map((rootComment) => (
            <CommentItem
              key={rootComment.id}
              comment={rootComment}
              postId={postId}
              childrenComments={rootComment.children || []}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentTree;

