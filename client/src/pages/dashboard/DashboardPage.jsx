import { useEffect, useState } from 'react';
import { Users, Building, Truck, Package, HardHat, UserCheck } from 'lucide-react';
import { dashboardApi } from '../../api/masterApi';
import { useAuth } from '../../contexts/AuthContext';

const CARD_DEFS = [
  { key: 'totalEmployees', label: 'Employees', Icon: Users },
  { key: 'activeSites', label: 'Active Sites', Icon: HardHat },
  { key: 'totalClients', label: 'Clients', Icon: Building },
  { key: 'totalSuppliers', label: 'Suppliers', Icon: Package },
  { key: 'totalLabourers', label: 'Labourers', Icon: UserCheck },
  { key: 'totalItems', label: 'Items', Icon: Package },
  { key: 'totalTrucks', label: 'Trucks', Icon: Truck },
  { key: 'activeUsers', label: 'Active Users', Icon: Users },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(({ data: res }) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="page-subtitle">Here's an overview of your construction operations</p>
        </div>
      </div>

      {loading ? (
        <div className="table-loading">Loading dashboard…</div>
      ) : (
        <div className="stat-grid">
          {CARD_DEFS.map(({ key, label, Icon }) => (
            <div key={key} className="stat-card">
              <div className="stat-icon">
                <Icon size={20} />
              </div>
              <div>
                <div className="stat-value">{data?.stats?.[key] ?? 0}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
