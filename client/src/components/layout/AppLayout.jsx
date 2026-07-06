import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth <= 900) {
      setMobileSidebarOpen(true);
    } else {
      setDesktopSidebarCollapsed(prev => !prev);
    }
  };

  return (
    <div className={`app-shell ${desktopSidebarCollapsed ? 'desktop-sidebar-collapsed' : ''}`}>
      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={handleMenuClick} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
