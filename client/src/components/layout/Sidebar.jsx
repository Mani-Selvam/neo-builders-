import { NavLink } from 'react-router-dom';
import { Building2, X } from 'lucide-react';
import { sidebarGroups } from '../../config/mastersConfig';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const canView = (moduleKey) => {
    if (!user) return false;
    if (!moduleKey) return true;
    if (user.isOwner) return true;
    return Boolean(user.role?.permissions?.[moduleKey]?.view);
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Building2 size={22} />
          <span>NeoBuilder ERP</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="sidebar-group">
              <div className="sidebar-group-title">{group.title}</div>
              {group.items.filter((item) => canView(item.moduleKey)).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
