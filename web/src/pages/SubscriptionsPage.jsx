import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptions } from '../store/subscriptionsSlice';
import { categoriesApi } from '../api/extraApis';
import PostCard from '../components/posts/PostCard';
import PostFilterToolbar from '../components/posts/PostFilterToolbar';
import { Bell, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: subscriptions = [], loading, error } = useSelector(
    (state) => state.subscriptions || {}
  );
  const { isAuthenticated } = useSelector((state) => state.auth || {});

  const safeSubscriptions = Array.isArray(subscriptions) ? subscriptions : [];

  const [categoriesList, setCategoriesList] = useState([]);
  const [sort, setSort] = useState('date_desc');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSubscriptions({ page: 1, limit: 100 }));
      categoriesApi
        .getCategories()
        .then((res) => setCategoriesList(res.categories || []))
        .catch(() => {});
    }
  }, [dispatch, isAuthenticated]);

  const handleCategoryToggle = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setSort('date_desc');
    setSelectedCategories([]);
    setStartDate('');
    setEndDate('');
  };

  const filteredSubscriptions = useMemo(() => {
    let result = [...safeSubscriptions];

    if (selectedCategories.length > 0) {
      result = result.filter((post) => {
        if (!post.category_ids) return false;
        const ids = post.category_ids.toString().split(',').map((id) => parseInt(id.trim(), 10));
        return selectedCategories.some((cId) => ids.includes(parseInt(cId, 10)));
      });
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((post) => new Date(post.publish_date).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((post) => new Date(post.publish_date).getTime() <= end.getTime());
    }

    result.sort((a, b) => {
      const scoreA = parseInt(a.likes_count || 0, 10);
      const scoreB = parseInt(b.likes_count || 0, 10);
      const dateA = new Date(a.publish_date).getTime();
      const dateB = new Date(b.publish_date).getTime();

      if (sort === 'date_asc') {
        return dateA - dateB;
      } else if (sort === 'likes_desc') {
        if (scoreB !== scoreA) return scoreB - scoreA;
        return dateB - dateA;
      } else if (sort === 'likes_asc') {
        if (scoreA !== scoreB) return scoreA - scoreB;
        return dateA - dateB;
      } else {
        // 'date_desc' (Default: recently added)
        return dateB - dateA;
      }
    });

    return result;
  }, [safeSubscriptions, sort, selectedCategories, startDate, endDate]);

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
      {/* Header Banner */}
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
        <Bell size={24} color="#f97316" fill="#f97316" />
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

      {/* Filter and Sorting Toolbar */}
      {safeSubscriptions.length > 0 && (
        <PostFilterToolbar
          sort={sort}
          onSortChange={setSort}
          categoriesList={categoriesList}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onReset={handleReset}
        />
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
      ) : filteredSubscriptions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '0.75rem' }}>No subscribed questions match your active filters.</p>
          <button className="btn btn-primary btn-sm" onClick={handleReset}>
            Clear Active Filters
          </button>
        </div>
      ) : (
        filteredSubscriptions.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};

export default SubscriptionsPage;
