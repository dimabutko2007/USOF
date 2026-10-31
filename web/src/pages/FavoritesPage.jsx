import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFavorites } from '../store/favoritesSlice';
import { categoriesApi } from '../api/extraApis';
import PostCard from '../components/posts/PostCard';
import PostFilterToolbar from '../components/posts/PostFilterToolbar';
import Pagination from '../components/common/Pagination';
import { Star, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const { items: favorites, loading } = useSelector((state) => state.favorites);

  const [categoriesList, setCategoriesList] = useState([]);
  const [sort, setSort] = useState('date_desc');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchFavorites());
    categoriesApi
      .getCategories()
      .then((res) => setCategoriesList(res.categories || []))
      .catch(() => {});
  }, [dispatch]);

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

  const filteredFavorites = useMemo(() => {
    let result = [...favorites];

    if (selectedCategories.length > 0) {
      result = result.filter((post) => {
        if (!post.category_ids) return false;
        const ids = post.category_ids.toString().split(',').map((id) => parseInt(id.trim(), 10));
        return selectedCategories.some((cId) => ids.includes(parseInt(cId, 10)));
      });
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter(
        (post) => new Date(post.publish_date || post.favorited_at).getTime() >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(
        (post) => new Date(post.publish_date || post.favorited_at).getTime() <= end.getTime()
      );
    }

    result.sort((a, b) => {
      const scoreA = parseInt(a.likes_count || 0, 10);
      const scoreB = parseInt(b.likes_count || 0, 10);
      const dateA = new Date(a.publish_date || a.favorited_at).getTime();
      const dateB = new Date(b.publish_date || b.favorited_at).getTime();

      if (sort === 'date_asc') {
        return dateA - dateB;
      } else if (sort === 'likes_desc') {
        if (scoreB !== scoreA) return scoreB - scoreA;
        return dateB - dateA;
      } else if (sort === 'likes_asc') {
        if (scoreA !== scoreB) return scoreA - scoreB;
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    return result;
  }, [favorites, sort, selectedCategories, startDate, endDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sort, selectedCategories, startDate, endDate]);

  const totalPages = Math.ceil(filteredFavorites.length / pageSize) || 1;
  const paginatedFavorites = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFavorites.slice(startIndex, startIndex + pageSize);
  }, [filteredFavorites, currentPage, pageSize]);

  const hasActiveFilters =
    selectedCategories.length > 0 || Boolean(startDate) || Boolean(endDate);

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
        <Star size={24} color="var(--color-warning)" fill="currentColor" />
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>My Saved Questions (Favorites)</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Quickly reference important technical discussions and solutions you've bookmarked.
          </p>
        </div>
      </div>

      {/* Filter and Sorting Toolbar */}
      {favorites.length > 0 && (
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
      ) : filteredFavorites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '0.75rem' }}>No saved questions match your active filters.</p>
          <button className="btn btn-primary btn-sm" onClick={handleReset}>
            Clear Active Filters
          </button>
        </div>
      ) : (
        <>
          {paginatedFavorites.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredFavorites.length}
            onPageChange={setCurrentPage}
            itemName="saved questions"
          />
        </>
      )}
    </div>
  );
};

export default FavoritesPage;
