import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Power } from 'lucide-react';
import { mastersConfig } from '../../config/mastersConfig';
import { createMasterApi } from '../../api/masterApi';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { getPath } from '../../utils/objectPath';
import MasterFormModal from '../../components/masters/MasterFormModal';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';

export default function MasterPage() {
  const { slug } = useParams();
  const config = mastersConfig[slug];
  const toast = useToast();
  const confirm = useConfirm();

  const api = useMemo(() => createMasterApi(config.endpoint), [config.endpoint]);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.list({ page, limit: pageSize, search });
      setRows(data.data || []);
      setTotal(data.meta?.total ?? (data.data || []).length);
    } catch {
      toast.error(`Failed to load ${config.plural.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [api, page, pageSize, search, config.plural, toast]);

  useEffect(() => {
    setPage(1);
    setRows([]);
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (row) => {
    const ok = await confirm({
      title: `Delete ${config.title}`,
      message: `Are you sure you want to delete this ${config.title.toLowerCase()}? This action cannot be undone.`,
      confirmText: 'Delete',
    });
    if (!ok) return;
    try {
      await api.remove(row._id);
      toast.success(`${config.title} deleted successfully`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const nextStatus = row.status === 'active' ? 'inactive' : 'active';
      await api.updateStatus(row._id, nextStatus);
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const renderCell = (row, col) => {
    const value = getPath(row, col.key);
    if (col.type === 'ref') {
      if (!value) return '—';
      return value.departmentName || value.designationName || value.categoryName || value.uomName ||
        value.siteName || value.siteType || value.vehicleType || value.name || value.empName || '—';
    }
    if (value === undefined || value === null || value === '') return '—';
    return String(value);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{config.plural}</h1>
          <p className="page-subtitle">{config.description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingRow(null); setModalOpen(true); }}>
          <Plus size={16} /> Add {config.title}
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input">
          <Search size={16} />
          <input
            placeholder={`Search ${config.plural.toLowerCase()}…`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="table-loading">Loading…</div>
        ) : rows.length === 0 ? (
          <EmptyState
            title={`No ${config.plural.toLowerCase()} yet`}
            description={`Get started by adding your first ${config.title.toLowerCase()}.`}
            action={
              <button className="btn btn-primary" onClick={() => { setEditingRow(null); setModalOpen(true); }}>
                <Plus size={16} /> Add {config.title}
              </button>
            }
          />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {config.columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                  <th>Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row._id}>
                    {config.columns.map((col) => (
                      <td key={col.key}>{renderCell(row, col)}</td>
                    ))}
                    <td>
                      <button className="badge-btn" onClick={() => handleToggleStatus(row)}>
                        <StatusBadge status={row.status} />
                      </button>
                    </td>
                    <td className="col-actions">
                      <button className="icon-btn" onClick={() => { setEditingRow(row); setModalOpen(true); }} aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn" onClick={() => handleToggleStatus(row)} aria-label="Toggle status">
                        <Power size={15} />
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(row)} aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onChange={setPage} />

      {modalOpen && (
        <MasterFormModal
          config={config}
          initialData={editingRow}
          toast={toast}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchData(); }}
        />
      )}
    </div>
  );
}
