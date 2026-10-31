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

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
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

        {pageNumbers.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0.25rem 0.4rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  userSelect: 'none',
                }}
              >
                ...
              </span>
            );
          }
          return (
            <button
              key={p}
              className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-outline'}`}
              style={{
                minWidth: '32px',
                padding: '0.35rem 0.5rem',
                fontWeight: p === currentPage ? 700 : 500,
              }}
              onClick={() => {
                onPageChange(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {p}
            </button>
          );
        })}

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

