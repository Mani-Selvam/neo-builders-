import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Menu } from 'lucide-react';

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth <= 900) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setDesktopSidebarCollapsed(prev => !prev);
    }
  };

  const isSidebarOpen = window.innerWidth <= 900 ? mobileSidebarOpen : !desktopSidebarCollapsed;

  return (
    <div className={`app-shell ${desktopSidebarCollapsed ? 'desktop-sidebar-collapsed' : ''} ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
      {/* Floating Sidebar Toggle Button */}
      <button
        onClick={handleToggle}
        className="sidebar-toggle-btn"
        aria-label="Toggle Navigation"
      >
        {isMobile && !isSidebarOpen ? (
          <Menu size={14} />
        ) : isSidebarOpen ? (
          <ChevronLeft size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
      </button>

      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} collapsed={desktopSidebarCollapsed && !isMobile} />
      <div className="app-main">
        {/* Navigation History Control Bar */}
        <div className="navigation-history-bar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          height: '52px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          {/* Back & Forward History Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => navigate(-1)}
              title="Go Back"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'none',
                color: 'var(--text-h)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <ArrowLeft size={14} />
            </button>
            <button
              onClick={() => navigate(1)}
              title="Go Forward"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'none',
                color: 'var(--text-h)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Breadcrumbs based on path */}
          <div className="header-breadcrumbs" style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', textTransform: 'capitalize' }}>
            <span>Home</span>
            {location.pathname.split('/').filter(Boolean).map((part, index, arr) => (
              <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>/</span>
                <span style={{ color: index === arr.length - 1 ? 'var(--text-h)' : 'var(--text-muted)', fontWeight: index === arr.length - 1 ? '600' : '400' }}>
                  {part.replace(/-/g, ' ')}
                </span>
              </span>
            ))}
          </div>

          {/* Portal target for page actions (search & add button) */}
          <div id="header-actions-target" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }} />
        </div>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
