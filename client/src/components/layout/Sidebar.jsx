import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Building2, ChevronDown, X } from 'lucide-react';
import { sidebarGroups } from '../../config/mastersConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

function DynamicIcon({ name, size = 16, className }) {
  const IconComp = Icons[name] || Icons.Circle;
  return <IconComp size={size} className={className} />;
}

function GroupPanel({ isOpen, children }) {
  const innerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(isOpen ? 'none' : '0px');

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (isOpen) {
      const height = el.scrollHeight;
      setMaxHeight(height + 'px');
      const timeout = setTimeout(() => setMaxHeight('none'), 220);
      return () => clearTimeout(timeout);
    }
    setMaxHeight(el.scrollHeight + 'px');
    requestAnimationFrame(() => setMaxHeight('0px'));
  }, [isOpen]);

  return (
    <div className="sidebar-group-panel" style={{ maxHeight }}>
      <div className="sidebar-group-items" ref={innerRef}>
        {children}
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose, collapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode, resolvedTheme } = useTheme();
  const [activeTooltip, setActiveTooltip] = useState({ text: '', top: 0 });

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setMode(next);
  };

  const ThemeIcon = mode === 'system' ? Icons.Monitor : resolvedTheme === 'dark' ? Icons.Moon : Icons.Sun;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const canView = (moduleKey) => {
    if (!user) return false;
    if (!moduleKey) return true;
    if (user.isOwner) return true;
    return Boolean(user.role?.permissions?.[moduleKey]?.view);
  };

  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    sidebarGroups.forEach((group) => {
      initial[group.title] = group.items ? group.items.some((item) => location.pathname.startsWith(item.path)) : false;
    });
    return initial;
  });

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      sidebarGroups.forEach((group) => {
        if (group.items && group.items.some((item) => location.pathname.startsWith(item.path))) {
          next[group.title] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  const toggleGroup = (title) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const getCompanyInitials = (name) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px 20px 16px', gap: '10px', height: 'auto', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu" style={{ position: 'absolute', right: '12px', top: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>

          {collapsed ? (
            <div
              onClick={() => { navigate('/settings/company-profile'); onClose(); }}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', width: '100%' }}
              data-tooltip={user?.company?.companyName || 'Company Account'}
            >
              {user?.company?.logo?.url ? (
                <div className="company-logo-circle" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--accent)', padding: '1px', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`${import.meta.env.VITE_API_URL}${user.company.logo.url}`}
                    alt="Company Logo"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="user-avatar" style={{ width: '42px', height: '42px', fontSize: '14px', borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: '700' }}>
                  {getCompanyInitials(user?.company?.companyName)}
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => {
                navigate('/settings/company-profile');
                onClose();
              }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '10px' }}
              data-tooltip="Open Company Profile"
            >
              {user?.company?.logo?.url ? (
                <div className="company-logo-circle" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid var(--accent)', padding: '2px', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={`${import.meta.env.VITE_API_URL}${user.company.logo.url}`}
                    alt="Company Logo"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '20px', borderRadius: '50%', border: '3px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontWeight: '600' }}>
                  {getCompanyInitials(user?.company?.companyName)}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {user?.company?.companyName || 'Company Account'}
                </span>
                <span style={{ fontSize: '10.5px', color: 'var(--accent)', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {user?.role?.name || 'Administrator'}
                </span>
              </div>
            </div>
          )}
        </div>
        <nav className="sidebar-nav" onScroll={() => setActiveTooltip({ text: '', top: 0 })}>
          {sidebarGroups.map((group) => {
            if (group.isDirect) {
              if (!canView(group.moduleKey)) return null;
              const isActive = location.pathname.startsWith(group.path);
              return (
                <div key={group.title} className="sidebar-group" style={{ marginBottom: '12px' }}>
                  <NavLink
                    to={group.path}
                    className={() => `sidebar-group-title ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                    data-tooltip={group.title}
                    onMouseEnter={(e) => {
                      if (!collapsed) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActiveTooltip({ text: group.title, top: rect.top + rect.height / 2 - 17 });
                    }}
                    onMouseLeave={() => setActiveTooltip({ text: '', top: 0 })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      textAlign: 'left',
                      width: '100%',
                      margin: 0,
                    }}
                  >
                    <div className="sidebar-group-title-left">
                      {group.icon && <DynamicIcon name={group.icon} size={15} className="sidebar-group-icon" />}
                      <span>{group.title}</span>
                    </div>
                  </NavLink>
                </div>
              );
            }

            const visibleItems = group.items ? group.items.filter((item) => canView(item.moduleKey)) : [];
            if (visibleItems.length === 0) return null;
            const isOpen = Boolean(expanded[group.title]);
            return (
              <div key={group.title} className="sidebar-group">
                <button
                  type="button"
                  className={`sidebar-group-title ${isOpen ? 'is-open' : ''}`}
                  onClick={() => toggleGroup(group.title)}
                  data-tooltip={group.title}
                  onMouseEnter={(e) => {
                    if (!collapsed) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({ text: group.title, top: rect.top + rect.height / 2 - 17 });
                  }}
                  onMouseLeave={() => setActiveTooltip({ text: '', top: 0 })}
                >
                  <div className="sidebar-group-title-left">
                    <span>{group.title}</span>
                  </div>
                  <ChevronDown size={14} className="sidebar-group-chevron" />
                </button>
                <GroupPanel isOpen={isOpen}>
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                      data-tooltip={item.label}
                      onMouseEnter={(e) => {
                        if (!collapsed) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActiveTooltip({ text: item.label, top: rect.top + rect.height / 2 - 17 });
                      }}
                      onMouseLeave={() => setActiveTooltip({ text: '', top: 0 })}
                    >
                      {item.icon && <DynamicIcon name={item.icon} size={15} className="sidebar-link-icon" />}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </GroupPanel>
              </div>
            );
          })}
        </nav>
        {/* Sidebar Footer: Theme & Logout buttons */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={cycleTheme}
            data-tooltip={`Theme: ${mode}`}
            onMouseEnter={(e) => {
              if (!collapsed) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setActiveTooltip({ text: `Theme: ${mode}`, top: rect.top + rect.height / 2 - 17 });
            }}
            onMouseLeave={() => setActiveTooltip({ text: '', top: 0 })}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease'
            }}
          >
            <ThemeIcon size={14} />
            Theme: {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>

          <button
            onClick={handleLogout}
            data-tooltip="Logout"
            onMouseEnter={(e) => {
              if (!collapsed) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setActiveTooltip({ text: "Logout", top: rect.top + rect.height / 2 - 17 });
            }}
            onMouseLeave={() => setActiveTooltip({ text: '', top: 0 })}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              background: 'none',
              color: 'var(--danger)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease'
            }}
          >
            <Icons.LogOut size={14} />
            Logout
          </button>
        </div>

        {collapsed && activeTooltip.text && (
          <div className="sidebar-custom-tooltip" style={{ top: `${activeTooltip.top}px` }}>
            {activeTooltip.text}
          </div>
        )}
      </aside>
    </>
  );
}
