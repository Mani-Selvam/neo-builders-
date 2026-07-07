import { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Monitor, LogOut, User, ChevronDown, Search } from 'lucide-react';
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
      <button className="icon-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <Menu size={20} />
      </button>
      
      <div className="topbar-search">
        <Search className="topbar-search-icon" size={16} />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="topbar-spacer" />
      <button className="icon-btn" onClick={cycleTheme} title={`Theme: ${mode}`} aria-label="Toggle theme">
        <ThemeIcon size={18} />
      </button>
      <div className="topbar-user" ref={ref}>
        <button className="topbar-user-btn" onClick={() => setMenuOpen((v) => !v)}>
          {user?.company?.logo?.url ? (
            <img 
              src={`${import.meta.env.VITE_API_URL}${user.company.logo.url}`} 
              alt="Company Logo" 
              style={{ height: '32px', maxWidth: '120px', objectFit: 'contain', borderRadius: '4px' }} 
            />
          ) : (
            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          )}
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
