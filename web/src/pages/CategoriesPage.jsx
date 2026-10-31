import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { categoriesApi } from '../api/extraApis';
import { setFilter } from '../store/postsSlice';
import { Tag, Plus, Hash, Layers } from 'lucide-react';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const loadCategories = () => {
    categoriesApi
      .getCategories()
      .then((res) => setCategories(res.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSelectCategory = (catId) => {
    dispatch(setFilter({ categories: [catId] }));
    navigate('/');
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
      });
      setNewTitle('');
      setNewDesc('');
      setIsCreating(false);
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Tag size={24} color="var(--accent-primary)" />
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Topic Categories & Tags</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Explore questions grouped by programming languages, frameworks, and architecture.
            </p>
          </div>
        </div>

        {role === 'admin' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsCreating(!isCreating)}
          >
            <Plus size={16} />
            <span>{isCreating ? 'Cancel' : 'New Category'}</span>
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreateCategory} className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Create New Topic Category (Admin)
          </h3>
          <div className="form-group">
            <label className="form-label">Category Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Docker & DevOps"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Brief description of the subject area..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Save Category
          </button>
        </form>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Loading categories...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="card fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onClick={() => handleSelectCategory(cat.id)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Hash size={18} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{cat.title}</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {cat.description || 'General discussions and technical inquiries.'}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <span className="badge badge-primary" style={{ padding: '0.25rem 0.65rem' }}>
                  Explore Questions →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;

