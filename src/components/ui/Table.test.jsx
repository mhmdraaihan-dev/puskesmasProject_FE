import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from './Table';

describe('Table Component', () => {
  const mockColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ];

  const mockData = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
  ];

  describe('Rendering', () => {
    it('renders table with correct columns and data', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      // Check headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      
      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('renders correct number of rows', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} />);
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(2);
    });

    it('applies custom className', () => {
      const { container } = render(
        <Table columns={mockColumns} data={mockData} className="custom-class" />
      );
      expect(container.querySelector('.table-container')).toHaveClass('custom-class');
    });
  });

  describe('Custom Rendering', () => {
    it('uses render function when provided', () => {
      const columnsWithRender = [
        { key: 'name', label: 'Name' },
        { 
          key: 'email', 
          label: 'Email',
          render: (value) => <span data-testid="custom-email">{value.toUpperCase()}</span>
        },
      ];

      render(<Table columns={columnsWithRender} data={mockData} />);
      
      const customEmails = screen.getAllByTestId('custom-email');
      expect(customEmails).toHaveLength(2);
      expect(customEmails[0]).toHaveTextContent('JOHN@EXAMPLE.COM');
    });

    it('passes row data to render function', () => {
      const renderFn = vi.fn((value, row) => row.name);
      const columnsWithRender = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email', render: renderFn },
      ];

      render(<Table columns={columnsWithRender} data={mockData} />);
      
      expect(renderFn).toHaveBeenCalledWith('john@example.com', mockData[0]);
      expect(renderFn).toHaveBeenCalledWith('jane@example.com', mockData[1]);
    });

    it('displays "-" for null or undefined values', () => {
      const dataWithNull = [
        { name: 'John Doe', email: null },
        { name: 'Jane Smith', email: undefined },
      ];

      render(<Table columns={mockColumns} data={dataWithNull} />);
      
      const cells = screen.getAllByText('-');
      expect(cells).toHaveLength(2);
    });
  });

  describe('Column Configuration', () => {
    it('applies column width when specified', () => {
      const columnsWithWidth = [
        { key: 'name', label: 'Name', width: '200px' },
        { key: 'email', label: 'Email' },
      ];

      const { container } = render(<Table columns={columnsWithWidth} data={mockData} />);
      const nameHeader = container.querySelector('th');
      expect(nameHeader).toHaveStyle({ width: '200px' });
    });

    it('shows sort indicator for sortable columns', () => {
      const sortableColumns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email' },
      ];

      const { container } = render(<Table columns={sortableColumns} data={mockData} />);
      const sortIcons = container.querySelectorAll('.table-sort-icon');
      expect(sortIcons).toHaveLength(1);
    });

    it('applies sortable class to sortable headers', () => {
      const sortableColumns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email' },
      ];

      const { container } = render(<Table columns={sortableColumns} data={mockData} />);
      const headers = container.querySelectorAll('th');
      expect(headers[0]).toHaveClass('table-header--sortable');
      expect(headers[1]).not.toHaveClass('table-header--sortable');
    });
  });

  describe('Row Click Handling', () => {
    it('calls onRowClick when row is clicked', () => {
      const onRowClick = vi.fn();
      render(<Table columns={mockColumns} data={mockData} onRowClick={onRowClick} />);
      
      const firstRow = screen.getByText('John Doe').closest('tr');
      fireEvent.click(firstRow);
      
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
      expect(onRowClick).toHaveBeenCalledTimes(1);
    });

    it('adds clickable class when onRowClick is provided', () => {
      const onRowClick = vi.fn();
      const { container } = render(
        <Table columns={mockColumns} data={mockData} onRowClick={onRowClick} />
      );
      
      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveClass('table-row--clickable');
      });
    });

    it('does not add clickable class when onRowClick is not provided', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} />);
      
      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).not.toHaveClass('table-row--clickable');
      });
    });

    it('supports keyboard navigation with Enter key', () => {
      const onRowClick = vi.fn();
      render(<Table columns={mockColumns} data={mockData} onRowClick={onRowClick} />);
      
      const firstRow = screen.getByText('John Doe').closest('tr');
      fireEvent.keyDown(firstRow, { key: 'Enter' });
      
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('supports keyboard navigation with Space key', () => {
      const onRowClick = vi.fn();
      render(<Table columns={mockColumns} data={mockData} onRowClick={onRowClick} />);
      
      const firstRow = screen.getByText('John Doe').closest('tr');
      fireEvent.keyDown(firstRow, { key: ' ' });
      
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('sets tabIndex and role when clickable', () => {
      const onRowClick = vi.fn();
      const { container } = render(
        <Table columns={mockColumns} data={mockData} onRowClick={onRowClick} />
      );
      
      const firstRow = container.querySelector('tbody tr');
      expect(firstRow).toHaveAttribute('role', 'button');
      expect(firstRow).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Loading State', () => {
    it('displays loading spinner when loading is true', () => {
      render(<Table columns={mockColumns} data={[]} loading={true} />);
      
      expect(screen.getByText('Memuat data...')).toBeInTheDocument();
      const spinner = document.querySelector('.table-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('does not display data when loading', () => {
      render(<Table columns={mockColumns} data={mockData} loading={true} />);
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Memuat data...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty message when data is empty array', () => {
      render(<Table columns={mockColumns} data={[]} />);
      
      expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
    });

    it('displays custom empty message', () => {
      render(
        <Table 
          columns={mockColumns} 
          data={[]} 
          emptyMessage="Belum ada data pasien"
        />
      );
      
      expect(screen.getByText('Belum ada data pasien')).toBeInTheDocument();
    });

    it('displays empty state when data is null', () => {
      render(<Table columns={mockColumns} data={null} />);
      
      expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
    });

    it('does not display empty state when data has items', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.queryByText('Tidak ada data')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic table elements', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} />);
      
      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
      expect(container.querySelector('th')).toBeInTheDocument();
      expect(container.querySelector('td')).toBeInTheDocument();
    });

    it('hides sort icon from screen readers', () => {
      const sortableColumns = [
        { key: 'name', label: 'Name', sortable: true },
      ];

      const { container } = render(<Table columns={sortableColumns} data={mockData} />);
      const sortIcon = container.querySelector('.table-sort-icon');
      expect(sortIcon).toHaveAttribute('aria-hidden', 'true');
    });

    it('provides proper role for clickable rows', () => {
      const onRowClick = vi.fn();
      const { container } = render(
        <Table columns={mockColumns} data={mockData} onRowClick={onRowClick} />
      );
      
      const rows = container.querySelectorAll('tbody tr');
      rows.forEach(row => {
        expect(row).toHaveAttribute('role', 'button');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty columns array', () => {
      const { container } = render(<Table columns={[]} data={mockData} />);
      const headers = container.querySelectorAll('th');
      expect(headers).toHaveLength(0);
    });

    it('handles data with extra properties not in columns', () => {
      const dataWithExtra = [
        { name: 'John', email: 'john@example.com', extra: 'value' },
      ];

      render(<Table columns={mockColumns} data={dataWithExtra} />);
      
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.queryByText('value')).not.toBeInTheDocument();
    });

    it('handles missing properties in data', () => {
      const incompletData = [
        { name: 'John' }, // missing email
      ];

      render(<Table columns={mockColumns} data={incompletData} />);
      
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
