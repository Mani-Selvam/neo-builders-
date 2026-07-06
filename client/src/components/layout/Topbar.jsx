import { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Monitor, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { mode, setMode, resolvedTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cycleTheme = () => {
    const order = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setMode(next);
  };

  const ThemeIcon = mode === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="topbar-spacer" />
      <button className="icon-btn" onClick={cycleTheme} title={`Theme: ${mode}`} aria-label="Toggle theme">
        <ThemeIcon size={18} />
      </button>
      <div className="topbar-user" ref={ref}>
        <button className="topbar-user-btn" onClick={() => setMenuOpen((v) => !v)}>
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <span className="topbar-user-name">{user?.name}</span>
          <ChevronDown size={14} />
        </button>
        {menuOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <div className="dropdown-name">{user?.name}</div>
              <div className="dropdown-email">{user?.email}</div>
              <div className="dropdown-role">{user?.role?.name}</div>
            </div>
            <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate('/settings/company-profile'); }}>
              <User size={15} /> Company Profile
            </button>
            <button className="dropdown-item danger" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
