import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Building2, ChevronDown, X } from 'lucide-react';
import { sidebarGroups } from '../../config/mastersConfig';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const canView = (moduleKey) => {
    if (!user) return false;
    if (!moduleKey) return true;
    if (user.isOwner) return true;
    return Boolean(user.role?.permissions?.[moduleKey]?.view);
  };

  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    sidebarGroups.forEach((group) => {
      initial[group.title] = group.items.some((item) => location.pathname.startsWith(item.path));
    });
    return initial;
  });

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      sidebarGroups.forEach((group) => {
        if (group.items.some((item) => location.pathname.startsWith(item.path))) {
          next[group.title] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  const toggleGroup = (title) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
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
          {sidebarGroups.map((group) => {
            const visibleItems = group.items.filter((item) => canView(item.moduleKey));
            if (visibleItems.length === 0) return null;
            const isOpen = Boolean(expanded[group.title]);
            return (
              <div key={group.title} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-group-title ${isOpen ? 'is-open' : ''}`}
                  onClick={() => toggleGroup(group.title)}
                >
                  <span>{group.title}</span>
                  <ChevronDown size={14} className="sidebar-group-chevron" />
                </button>
                {isOpen && (
                  <div className="sidebar-group-items">
                    {visibleItems.map((item) => (
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
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
