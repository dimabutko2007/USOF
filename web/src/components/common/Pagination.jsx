import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  itemName = 'questions',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      className="card pagination-container"
      style={{
        marginTop: '1.25rem',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>{' '}
        {totalItems > 0 && (
          <span>({totalItems} total {itemName})</span>
        )}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-outline btn-sm"
          disabled={currentPage <= 1}
          onClick={() => {
            onPageChange(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Previous Page"
        >
          <ChevronLeft size={15} />
          <span>Prev</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-outline'}`}
            style={{ minWidth: '34px', padding: '0.35rem 0.55rem', fontWeight: p === currentPage ? 700 : 500 }}
            onClick={() => {
              onPageChange(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {p}
          </button>
        ))}

        <button
          className="btn btn-outline btn-sm"
          disabled={currentPage >= totalPages}
          onClick={() => {
            onPageChange(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Next Page"
        >
          <span>Next</span>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

