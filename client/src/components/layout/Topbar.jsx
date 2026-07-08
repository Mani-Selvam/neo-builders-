import { Menu } from 'lucide-react';

export default function Topbar({ onMenuClick }) {

  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <Menu size={20} />
      </button>

      <div className="topbar-spacer" />
    </header>
  );
}
