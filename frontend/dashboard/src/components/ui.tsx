import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-actions">{action}</div>}
    </header>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-heading">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className="icon-button" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function TextField({
  label,
  hint,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <input {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <textarea {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function SelectField({
  label,
  children,
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      <select {...props}>{children}</select>
    </label>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`dialog ${wide ? 'dialog-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dialog-header">
          <h2>{title}</h2>
          <IconButton label="Tutup" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  busy = false,
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="dialog-body">
        <p>{description}</p>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Menghapus…' : 'Hapus'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function DataTable<TData extends object>({
  data,
  columns,
  searchPlaceholder = 'Cari data…',
  emptyLabel = 'Belum ada data.',
}: {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  searchPlaceholder?: string;
  emptyLabel?: string;
}) {
  const [globalFilter, setGlobalFilter] = useState('');
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="table-wrap">
      <div className="table-toolbar">
        <input
          className="search-input"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        <span className="table-count">{table.getFilteredRowModel().rows.length} data</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <button
                        className="sort-button"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() &&
                          (header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp size={13} />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown size={13} />
                          ) : (
                            <ArrowUpDown size={13} />
                          ))}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="empty-cell" colSpan={columns.length}>
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
          {Math.max(table.getPageCount(), 1)}
        </span>
        <div className="pagination-actions">
          <button
            className="pagination-button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </button>
          <button
            className="pagination-button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'red';
}) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

export function LoadingState({ label = 'Memuat data…' }: { label?: string }) {
  return (
    <div className="loading-state">
      <span className="spinner" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="error-state">
      <strong>Data belum dapat dimuat.</strong>
      <span>{message}</span>
    </div>
  );
}
