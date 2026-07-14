import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FileText, BarChart2 } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [portalTarget, setPortalTarget] = useState(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('header-actions-target'));
  }, []);

  return (
    <div className="page">
      {portalTarget && createPortal(
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="icon-btn" 
            onClick={() => navigate('/requests')}
            title="Open Material Requests"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
          >
            <FileText size={16} />
          </button>
        </div>,
        portalTarget
      )}

      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="page-subtitle">High-level insights and analytics for your company</p>
        </div>
      </div>

      <div className="table-card" style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
        <EmptyState
          icon={BarChart2}
          title="Analytics Coming Soon"
          description="Detailed pie charts, operational statistics, and financial summaries will be available here soon."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/requests')}>
              <FileText size={16} /> View Material Requests
            </button>
          }
        />
      </div>
    </div>
  );
}
