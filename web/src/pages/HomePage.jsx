import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { fetchPosts, setFilter, setPage, setLimit, resetFilters } from '../store/postsSlice';
import { categoriesApi } from '../api/extraApis';
import PostCard from '../components/posts/PostCard';
import Pagination from '../components/common/Pagination';
import {
  Filter,
  PlusCircle,
  Calendar,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  History,
  Sparkles,
} from 'lucide-react';

const HomePage = () => {
  const dispatch = useDispatch();
  const { openCreatePost } = useOutletContext() || {};

  const { items: posts, pagination, filters, loading, error } = useSelector((state) => state.posts);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [categoriesList, setCategoriesList] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasSearch = Boolean(filters.search && filters.search.trim());

  useEffect(() => {
    categoriesApi
      .getCategories()
      .then((res) => setCategoriesList(res.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };
    if (!hasSearch) params.sort = filters.sort;
    if (filters.search) params.search = filters.search;
    if (filters.categories && filters.categories.length > 0) {
      params.categories = filters.categories.join(',');
    }
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.status) params.status = filters.status;

    dispatch(fetchPosts(params));
  }, [dispatch, pagination.page, pagination.limit, filters]);

  const handleCategoryToggle = (id) => {
    const current = filters.categories || [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    dispatch(setFilter({ categories: next }));
  };

  const handleSortChange = (newSort) => {
    dispatch(setFilter({ sort: newSort }));
  };

  return (
    <div>
      {/* Top Banner / Hero Header */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-elevated) 100%)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Explore Community Questions
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Search questions, collaborate on bug fixes, and level up your engineering skills.
          </p>
        </div>
        {isAuthenticated && (
          <button className="btn btn-primary" onClick={openCreatePost}>
            <PlusCircle size={18} />
            <span>Ask Question</span>
          </button>
        )}
      </div>

      {/* Primary Filter & Sorting Toolbar */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '0.9rem 1.1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Quick Sort Tabs */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {hasSearch ? (
              <button
                className="btn btn-sm btn-primary"
                disabled
                title="Search results are automatically sorted by relevance"
              >
                <Sparkles size={15} />
                <span>Most Relevant</span>
              </button>
            ) : (
              <>
                <button
                  className={`btn btn-sm ${filters.sort === 'date_desc' || filters.sort === 'date' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleSortChange('date_desc')}
                  title="Recently added first (Default)"
                >
                  <Clock size={14} />
                  <span>Recently Added</span>
                </button>
                <button
                  className={`btn btn-sm ${filters.sort === 'date_asc' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleSortChange('date_asc')}
                  title="Oldest added first"
                >
                  <History size={14} />
                  <span>Oldest Added</span>
                </button>
                <button
                  className={`btn btn-sm ${filters.sort === 'likes_desc' || filters.sort === 'likes' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleSortChange('likes_desc')}
                  title="Highest rating first"
                >
                  <TrendingUp size={14} />
                  <span>Highest Rating</span>
                </button>
                <button
                  className={`btn btn-sm ${filters.sort === 'likes_asc' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleSortChange('likes_asc')}
                  title="Lowest rating first"
                >
                  <TrendingDown size={14} />
                  <span>Lowest Rating</span>
                </button>
              </>
            )}
          </div>

          {/* Toggle Filter Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${showAdvancedFilters ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter size={15} />
              <span>Filters {filters.categories.length > 0 ? `(${filters.categories.length})` : ''}</span>
            </button>
            {(filters.categories.length > 0 || filters.startDate || filters.endDate || filters.search) && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => dispatch(resetFilters())}
                title="Reset all filters"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Category & Date Filter Drawer */}
        {showAdvancedFilters && (
          <div
            style={{
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {/* Category Pills */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Filter by Category:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.4rem' }}>
                {categoriesList.map((cat) => {
                  const active = filters.categories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      className={`badge ${active ? 'badge-primary' : ''}`}
                      style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
                      onClick={() => handleCategoryToggle(cat.id)}
                    >
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Range Inputs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={15} color="var(--text-muted)" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}
                  value={filters.startDate}
                  onChange={(e) => dispatch(setFilter({ startDate: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>To:</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}
                  value={filters.endDate}
                  onChange={(e) => dispatch(setFilter({ endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Posts List Feed */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading latest discussions...
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-danger)' }}>
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No questions found matching your criteria. Try adjusting your filters or search query!
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}

      {/* Pagination Bar */}
      <Pagination
        currentPage={pagination?.page || 1}
        totalPages={pagination?.pages || 1}
        totalItems={pagination?.total || posts.length}
        onPageChange={(p) => dispatch(setPage(p))}
        itemName="posts"
      />
    </div>
  );
};

export default HomePage;

