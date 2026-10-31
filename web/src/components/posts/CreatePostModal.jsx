import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { postsApi } from '../../api/postsApi';
import { categoriesApi } from '../../api/extraApis';
import { fetchPosts } from '../../store/postsSlice';
import { X, Upload, Check, AlertCircle, EyeOff } from 'lucide-react';

const CreatePostModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      categoriesApi
        .getCategories()
        .then((res) => setAvailableCategories(res.categories || []))
        .catch(() => {});
      setTitle('');
      setContent('');
      setSelectedCategories([]);
      setFiles([]);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required.';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!content.trim()) {
      errs.content = 'Post content is required.';
    } else if (content.trim().length < 10) {
      errs.content = 'Post content must be at least 10 characters.';
    }

    if (selectedCategories.length === 0) {
      errs.categories = 'Please select at least one category.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e, statusChoice = 'active') => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('categories', JSON.stringify(selectedCategories));
      formData.append('status', statusChoice);

      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      await postsApi.createPost(formData);
      dispatch(fetchPosts({ page: 1 }));
      onClose();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ask a Question / Create Post</h2>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errors.form && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. How to handle async/await error in Express.js?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Categories Multi-Select */}
          <div className="form-group">
            <label className="form-label">Categories (Select at least one)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
              {availableCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`badge ${isSelected ? 'badge-primary' : ''}`}
                    style={{
                      cursor: 'pointer',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.82rem',
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{cat.title}</span>
                  </button>
                );
              })}
            </div>
            {errors.categories && <span className="form-error">{errors.categories}</span>}
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label">Problem Description & Details</label>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder="Provide enough details for developers to understand your question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {errors.content && <span className="form-error">{errors.content}</span>}
          </div>

          {/* Image Attachments */}
          <div className="form-group">
            <label className="form-label">Attach Screenshots / Diagrams (Optional)</label>
            <div
              style={{
                border: '1.5px dashed var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-input)',
              }}
              onClick={() => document.getElementById('post-images-file-input').click()}
            >
              <Upload size={24} color="var(--accent-primary)" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Click to browse or drag & drop images here
              </p>
              <input
                id="post-images-file-input"
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {files.map((file, idx) => (
                  <span key={idx} className="badge">
                    {file.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={(e) => handleSubmit(e, 'inactive')}
              disabled={loading}
              title="Save as hidden draft (visible only to you)"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <EyeOff size={15} />
              <span>Save as Draft</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => handleSubmit(e, 'active')}
              disabled={loading}
            >
              {loading ? 'Publishing...' : 'Publish Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

