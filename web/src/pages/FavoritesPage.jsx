import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '../store/favoritesSlice';
import PostCard from '../components/posts/PostCard';
import { Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const { items: favorites, loading } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  return (
    <div>
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
        <Star size={24} color="var(--color-warning)" fill="currentColor" />
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>My Saved Questions (Favorites)</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Quickly reference important technical discussions and solutions you've bookmarked.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading your saved questions...
        </div>
      ) : favorites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '1rem' }}>You don't have any saved questions yet.</p>
          <Link to="/" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} />
            <span>Browse Questions to Bookmark</span>
          </Link>
        </div>
      ) : (
        favorites.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};

export default FavoritesPage;

