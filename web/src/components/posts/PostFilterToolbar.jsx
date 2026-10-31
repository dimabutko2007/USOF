import React, { useState } from 'react';
import {
  Clock,
  History,
  TrendingUp,
  TrendingDown,
  Filter,
  RotateCcw,
  Calendar,
} from 'lucide-react';

const PostFilterToolbar = ({
  sort = 'date_desc',
  onSortChange,
  categoriesList = [],
  selectedCategories = [],
  onCategoryToggle,
  startDate = '',
  onStartDateChange,
  endDate = '',
  onEndDateChange,
  onReset,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasActiveFilters =
    selectedCategories.length > 0 || Boolean(startDate) || Boolean(endDate);

  return (
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Quick Sort Tabs */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${
              sort === 'date_desc' || sort === 'date' ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => onSortChange('date_desc')}
            title="Recently added first (Default)"
          >
            <Clock size={14} />
            <span>Recently Added</span>
          </button>

          <button
            className={`btn btn-sm ${sort === 'date_asc' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSortChange('date_asc')}
            title="Oldest added first"
          >
            <History size={14} />
            <span>Oldest Added</span>
          </button>

          <button
            className={`btn btn-sm ${
              sort === 'likes_desc' || sort === 'likes' ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => onSortChange('likes_desc')}
            title="Highest rating first"
          >
            <TrendingUp size={14} />
            <span>Highest Rating</span>
          </button>

          <button
            className={`btn btn-sm ${sort === 'likes_asc' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSortChange('likes_asc')}
            title="Lowest rating first"
          >
            <TrendingDown size={14} />
            <span>Lowest Rating</span>
          </button>
        </div>

        {/* Toggle Filters Button & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${showAdvancedFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter size={15} />
            <span>
              Filters {selectedCategories.length > 0 ? `(${selectedCategories.length})` : ''}
            </span>
          </button>

          {hasActiveFilters && (
            <button
              className="btn btn-sm btn-outline"
              onClick={onReset}
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
            gap: '0.85rem',
          }}
        >
          {/* Category Pills */}
          {categoriesList.length > 0 && (
            <div>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                Filter by Category:
              </span>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.45rem',
                  marginTop: '0.4rem',
                }}
              >
                {categoriesList.map((cat) => {
                  const active = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      className={`badge ${active ? 'badge-primary' : ''}`}
                      style={{ cursor: 'pointer', padding: '0.35rem 0.75rem' }}
                      onClick={() => onCategoryToggle(cat.id)}
                    >
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date Range Inputs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={15} color="var(--text-muted)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From:</span>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>To:</span>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFilterToolbar;

