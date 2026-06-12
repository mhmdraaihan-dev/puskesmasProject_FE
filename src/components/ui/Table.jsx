import React from 'react';
import PropTypes from 'prop-types';
import './Table.css';

/**
 * Table Component
 * 
 * Data table with dark navy surface styling, hover states, and support for
 * custom column rendering, sorting indicators, and row click handlers.
 * 
 * Features:
 * - Dark navy background (#181715) with cream text (#faf9f5)
 * - Hairline borders at 20% opacity for headers, 10% for rows
 * - Hover state with surface-dark-elevated background (#252320)
 * - Clickable rows with cursor pointer
 * - Loading and empty states
 * - Responsive horizontal scroll on small screens
 * 
 * @component
 * @example
 * // Basic table with custom render function
 * const columns = [
 *   { key: 'name', label: 'Nama', sortable: true },
 *   { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
 *   { key: 'actions', label: 'Aksi', render: (_, row) => <Button>Edit</Button>, width: '120px' }
 * ];
 * 
 * <Table 
 *   columns={columns}
 *   data={dataArray}
 *   onRowClick={(row) => navigate(`/detail/${row.id}`)}
 *   loading={isLoading}
 *   emptyMessage="Tidak ada data yang tersedia"
 * />
 * 
 * Requirements: 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 5.5, 9.11
 */
const Table = ({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = 'Tidak ada data',
  onRowClick,
  className = '',
  ...rest
}) => {
  // Loading state
  if (loading) {
    return (
      <div className="table-container">
        <div className="table-loading">
          <div className="table-spinner"></div>
          <p className="table-loading-text">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <p className="table-empty-text">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`} {...rest}>
      <div className="table-wrapper">
        <table className="table">
          <thead className="table-head">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key}
                  className={`table-header ${col.sortable ? 'table-header--sortable' : ''}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.label}
                  {col.sortable && (
                    <span className="table-sort-icon" aria-hidden="true">↕</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {data.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`table-row ${onRowClick ? 'table-row--clickable' : ''}`}
                onClick={() => onRowClick?.(row)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onRowClick(row);
                  }
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    {col.render 
                      ? col.render(row[col.key], row) 
                      : row[col.key] ?? '-'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Table.propTypes = {
  /**
   * Column definitions
   * Each column should have:
   * - key: string - property key in data object
   * - label: string - column header text
   * - sortable: boolean - whether to show sort indicator (optional)
   * - render: function(value, row) - custom render function (optional)
   * - width: string - CSS width value (optional)
   */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
      render: PropTypes.func,
      width: PropTypes.string,
    })
  ).isRequired,

  /**
   * Array of data objects to display
   * Each object should have properties matching column keys
   */
  data: PropTypes.array.isRequired,

  /**
   * Loading state - shows spinner when true
   */
  loading: PropTypes.bool,

  /**
   * Message to display when data array is empty
   */
  emptyMessage: PropTypes.string,

  /**
   * Callback when a row is clicked
   * Receives the row data object
   * When provided, rows become clickable with pointer cursor
   */
  onRowClick: PropTypes.func,

  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

export default Table;
