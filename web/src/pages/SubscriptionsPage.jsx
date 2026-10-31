import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptions } from '../store/subscriptionsSlice';
import PostCard from '../components/posts/PostCard';
import { Bell, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: subscriptions = [], pagination = { page: 1, limit: 10 }, loading, error } = useSelector(
    (state) => state.subscriptions || {}
  );
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSubscriptions({ page: pagination.page, limit: pagination.limit }));
    }
  }, [dispatch, isAuthenticated, pagination.page, pagination.limit]);

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        <p>Please log in to view your subscriptions.</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>
          Log In
        </button>
      </div>
    );
  }

  return (
    <div>
      {}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        }}
      >
        <Bell size={24} color="var(--color-primary)" fill="currentColor" />
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>My Subscriptions</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Topics and discussions you are following. You will receive notifications about updates.
          </p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: 'var(--color-danger)', textAlign: 'center', padding: '1rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading your subscriptions...
        </div>
      ) : safeSubscriptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '1rem' }}>You are not subscribed to any topics yet.</p>
          <Link to="/" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} />
            <span>Browse Questions to Follow</span>
          </Link>
        </div>
      ) : (
        safeSubscriptions.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};

export default SubscriptionsPage;
