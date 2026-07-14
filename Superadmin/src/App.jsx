import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  MapPin,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
  Briefcase,
  LogOut,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  Camera,
  Power
} from 'lucide-react';
import './App.css';

function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('superadmin_logged_in') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState(() => {
    const saved = localStorage.getItem('superadmin_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Super Admin',
      email: 'superadmin@gmail.com',
      role: 'System Administrator',
      avatarUrl: ''
    };
  });
  const [editName, setEditName] = useState(adminProfile.name);
  const [editAvatarUrl, setEditAvatarUrl] = useState(adminProfile.avatarUrl);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Dashboard Stats & Tables State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    completedProfiles: 0,
    pendingProfiles: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [profileFilter, setProfileFilter] = useState('all');
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);

  // Notification message
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Verify credentials
    setTimeout(() => {
      if (loginEmail === 'superadmin@gmail.com' && loginPassword === 'superadmin@123') {
        setIsLoggedIn(true);
        localStorage.setItem('superadmin_logged_in', 'true');
        showToast('Access granted. Welcome back, Super Admin!');
        fetchData();
      } else {
        setLoginError('Invalid email address or passcode. Please try again.');
      }
      setIsLoggingIn(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('superadmin_logged_in');
    setLoginEmail('');
    setLoginPassword('');
    showToast('Securely logged out from dashboard.');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...adminProfile,
      name: editName,
      avatarUrl: editAvatarUrl
    };
    setAdminProfile(updated);
    localStorage.setItem('superadmin_profile', JSON.stringify(updated));
    setShowProfileModal(false);
    showToast('Profile credentials updated successfully!');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    try {
      const response = await fetch('/api/v1/superadmin/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      if (result.success && result.data && result.data.url) {
        setEditAvatarUrl(result.data.url);
        showToast('Avatar image uploaded successfully!');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('[avatar-upload] Error:', err);
      alert(err.message || 'Failed to upload avatar image');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleCompanyStatus = async (id, currentStatus, companyName) => {
    try {
      const response = await fetch(`/api/v1/superadmin/companies/${id}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        // Update local company list state status
        setCompanies((prev) =>
          prev.map((c) => c._id === id ? { ...c, status: data.data.status } : c)
        );
        // Also update recentCompanies preview list
        setRecentCompanies((prev) =>
          prev.map((c) => c._id === id ? { ...c, status: data.data.status } : c)
        );

        const actionStr = data.data.status === 'Active' ? 'activated' : 'deactivated';
        showToast(`Company "${companyName}" has been successfully ${actionStr}!`);
      } else {
        showToast(data.message || 'Failed to toggle company status.');
      }
    } catch (err) {
      console.error('Error toggling company status:', err);
      showToast('Connection error toggling company status.');
    }
  };

  const fetchData = async (isRef = false) => {
    if (!localStorage.getItem('superadmin_logged_in')) return;

    if (isRef) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch stats
      const statsRes = await fetch('/api/v1/superadmin/dashboard-stats');
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.data.stats);
        setRecentCompanies(statsData.data.recentCompanies || []);
      }

      // Fetch companies list
      const compRes = await fetch('/api/v1/superadmin/companies');
      const compData = await compRes.json();

      if (compData.success) {
        setCompanies(compData.data || []);
      }

      if (isRef) showToast('Data refreshed successfully from Database!');
    } catch (err) {
      console.error('Error fetching superadmin data:', err);
      showToast('Error syncing with backend database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const toggleExpandCompany = (id) => {
    if (expandedCompanyId === id) {
      setExpandedCompanyId(null);
    } else {
      setExpandedCompanyId(id);
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper to get relative logo URL
  const getLogoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');
    const cleanPath = url.replace(/^\//, '');
    return baseUrl ? `${baseUrl.replace(/\/$/, '')}/${cleanPath}` : `/${cleanPath}`;
  };

  // Companies filtering logic
  const filteredCompanies = companies.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.companyName.toLowerCase().includes(query) ||
      c.companyCode.toLowerCase().includes(query) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.mobileNo && c.mobileNo.includes(query));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    let matchesProfile = true;
    if (profileFilter === 'completed') {
      matchesProfile = c.profileCompleted === true;
    } else if (profileFilter === 'incomplete') {
      matchesProfile = c.profileCompleted === false;
    }

    return matchesSearch && matchesStatus && matchesProfile;
  });

  // Render Login Page if not logged in
  if (!isLoggedIn) {
    return (
      <div className="login-page-wrapper" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-primary)',
        fontFamily: 'var(--font-body)',
        padding: '20px'
      }}>
        <div className="login-card" style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 32px',
          width: '100%',
          maxWidth: '430px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Logo Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <div className="logo-icon" style={{ width: '48px', height: '48px', margin: '0 auto 8px' }}>
              <Briefcase size={26} strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '750', color: 'var(--text-primary)' }}>NeoBuilder Console</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Secure Superadmin Access Control</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {loginError && (
              <div style={{
                background: 'var(--danger-bg)',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                color: 'var(--danger)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group-login" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '650', color: 'var(--text-secondary)' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="superadmin@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div className="form-group-login" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '650', color: 'var(--text-secondary)' }}>PASSCODE</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 40px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            Superadmin credentials: <code>superadmin@gmail.com / superadmin@123</code>
          </div>
        </div>
        {/* Global Fallback Toast Notification */}
        {toast && (
          <div className="premium-toast">
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span>{toast}</span>
          </div>
        )}
      </div>
    );
  }

  // Dashboard Page when logged in
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px 16px 16px', gap: '10px' }}>
          <div
            onClick={() => {
              setEditName(adminProfile.name);
              setEditAvatarUrl(adminProfile.avatarUrl);
              setShowProfileModal(true);
            }}
            style={{ cursor: 'pointer' }}
            title="Click to edit profile"
          >
            {adminProfile.avatarUrl ? (
              <div className="superadmin-logo-circle" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid var(--primary)', padding: '2px', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={adminProfile.avatarUrl} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '20px', borderRadius: '50%', border: '3px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                {adminProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)' }}>{adminProfile.name}</span>
            <span style={{ fontSize: '10.5px', color: 'var(--primary)', fontWeight: '600', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{adminProfile.role}</span>
          </div>
        </div>

        <ul className="nav-links">
          <li>
            <button
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Layers size={18} />
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeTab === 'companies' ? 'active' : ''}`}
              onClick={() => setActiveTab('companies')}
            >
              <Building2 size={18} />
              Companies
            </button>
          </li>
        </ul>

        {/* Logout button */}
        <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={handleLogout}
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
            <LogOut size={14} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Page Top Header */}
        <header className="page-header">
          <div className="page-title-group">
            <h1>{activeTab === 'dashboard' ? 'Dashboard Overview' : 'Registered Companies'}</h1>
            <p className="page-description">
              {activeTab === 'dashboard'
                ? 'High-level real-time analytics from MongoDB registration records.'
                : 'Manage signup company users, review field profile completion details, and check active accounts.'
              }
            </p>
          </div>
          <div className="header-actions">
            <button className="refresh-button" onClick={() => fetchData(true)} disabled={refreshing || loading}>
              <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Syncing...' : 'Sync Database'}
            </button>
          </div>
        </header>

        {loading ? (
          // Skeleton/Loading UI
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="stats-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card skeleton" style={{ height: '140px' }} />
              ))}
            </div>
            <div className="section-card skeleton" style={{ height: '400px' }} />
          </div>
        ) : (
          <>
            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Stats cards Grid */}
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-header">
                      <span className="stat-title">Total Companies</span>
                      <div className="stat-icon">
                        <Building2 size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{stats.totalCompanies}</div>
                    <div className="stat-footer">Registered company accounts</div>
                  </div>

                  <div className="stat-card success">
                    <div className="stat-header">
                      <span className="stat-title">Completed Profiles</span>
                      <div className="stat-icon">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{stats.completedProfiles}</div>
                    <div className="stat-footer">
                      <span>{stats.totalCompanies > 0 ? Math.round((stats.completedProfiles / stats.totalCompanies) * 100) : 0}%</span> of total profiles
                    </div>
                  </div>

                  <div className="stat-card warning">
                    <div className="stat-header">
                      <span className="stat-title">Pending Profiles</span>
                      <div className="stat-icon">
                        <AlertCircle size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{stats.pendingProfiles}</div>
                    <div className="stat-footer">
                      Companies with incomplete profiles
                    </div>
                  </div>

                  <div className="stat-card info">
                    <div className="stat-header">
                      <span className="stat-title">Platform Users</span>
                      <div className="stat-icon">
                        <Users size={20} />
                      </div>
                    </div>
                    <div className="stat-value">{stats.totalUsers}</div>
                    <div className="stat-footer">Total registered user profiles</div>
                  </div>
                </div>

                {/* Dashboard Inner Grid */}
                <div className="dashboard-grid">
                  <div className="section-card">
                    <div className="section-header">
                      <h2 className="section-title">
                        <Building2 size={20} />
                        Recent Registrations
                      </h2>
                    </div>

                    {recentCompanies.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          <Building2 size={32} />
                        </div>
                        <h3>No data registered</h3>
                        <p>No companies currently signed up in the local database instance.</p>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Company</th>
                              <th>Owner / Signup Details</th>
                              <th>Profile Status</th>
                              <th>Status</th>
                              <th>Joined Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentCompanies.map((c) => (
                              <tr key={c._id}>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{c.companyName}</strong>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.companyCode}</span>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '500' }}>{c.contactPerson}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.email}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="progress-container">
                                    <div className="progress-bar-bg">
                                      <div
                                        className="progress-bar-fill"
                                        style={{ width: `${c.profileCompletionPercentage}%` }}
                                      />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: '600' }}>
                                      {c.profileCompletionPercentage}%
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${c.status === 'Active' ? 'success' : 'warning'}`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td>{formatDate(c.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="section-card">
                    <div className="section-header">
                      <h2 className="section-title">
                        <CheckCircle2 size={18} />
                        Quick Instructions
                      </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px', lineHeight: '1.6' }}>
                      <p>
                        This portal shows live records directly from your database. You can:
                      </p>
                      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <li>View signup users mapped under each company account.</li>
                        <li>Verify profile completion ratios.</li>
                        <li>Confirm if profile fields are filled out. Blank fields are visualised and styled in the companies view.</li>
                      </ul>
                      <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                        <span style={{ fontWeight: '600', color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>Registering a company:</span>
                        Register via client portal and view the results populated on this panel instantly.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Companies Tab Content */}
            {activeTab === 'companies' && (
              <div className="section-card">
                {/* Search & Filter Toolbar */}
                <div className="toolbar">
                  <div className="search-wrapper">
                    <Search className="search-icon" size={16} />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search company code, name, client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <select
                      className="select-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>

                    <select
                      className="select-filter"
                      value={profileFilter}
                      onChange={(e) => setProfileFilter(e.target.value)}
                    >
                      <option value="all">All Profile States</option>
                      <option value="completed">Fully Completed</option>
                      <option value="incomplete">Incomplete / Empty</option>
                    </select>
                  </div>
                </div>

                {filteredCompanies.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Building2 size={32} />
                    </div>
                    <h3>No companies found</h3>
                    <p>No companies match the search query and filters specified.</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Code</th>
                          <th>Company Name</th>
                          <th>Contact Person</th>
                          <th>Contact Info</th>
                          <th>Profile Form Status</th>
                          <th>Status</th>
                          <th>Signup Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCompanies.map((c) => {
                          const isExpanded = expandedCompanyId === c._id;
                          return (
                            <>
                              <tr
                                key={c._id}
                                onClick={() => toggleExpandCompany(c._id)}
                                className={`main-row ${isExpanded ? 'expanded-header' : ''}`}
                              >
                                <td>
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </td>
                                <td>
                                  <strong style={{ color: 'var(--primary)' }}>{c.companyCode}</strong>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {c.logo?.url ? (
                                      <div className="company-logo-preview" style={{ width: '28px', height: '28px' }}>
                                        <img src={getLogoUrl(c.logo.url)} alt="" />
                                      </div>
                                    ) : null}
                                    <strong>{c.companyName}</strong>
                                  </div>
                                </td>
                                <td>{c.contactPerson}</td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                                    <span>{c.email}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{c.mobileNo}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="progress-container">
                                    <div className="progress-bar-bg" style={{ width: '70px' }}>
                                      <div
                                        className="progress-bar-fill"
                                        style={{ width: `${c.profileCompletionPercentage}%` }}
                                      />
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '700' }}>
                                      {c.profileCompletionPercentage}%
                                    </span>
                                    {c.profileCompleted ? (
                                      <span className="badge success" style={{ padding: '2px 4px', fontSize: '9px' }}>Filled</span>
                                    ) : (
                                      <span className="badge warning" style={{ padding: '2px 4px', fontSize: '9px' }}>Incomplete</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${c.status === 'Active' ? 'success' : 'warning'}`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td>{formatDate(c.createdAt)}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleToggleCompanyStatus(c._id, c.status, c.companyName)}
                                    title={c.status === 'Active' ? 'Deactivate Company' : 'Activate Company'}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: c.status === 'Active' ? '#dc2626' : '#16a34a',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      backgroundColor: c.status === 'Active' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(22, 163, 74, 0.1)',
                                      transition: 'transform 0.15s ease, background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                  >
                                    <Power size={14} />
                                  </button>
                                </td>
                              </tr>

                              {/* Expandable Details container */}
                              {isExpanded && (
                                <tr className="detail-row">
                                  <td colSpan="9">
                                    <div className={`detail-panel ${isExpanded ? 'open' : ''}`}>
                                      <div className="detail-grid">
                                        {/* Company Profile information panel page */}
                                        <div className="detail-section">
                                          <h3 className="detail-section-title">
                                            <FileText size={16} />
                                            Company Profile Fields (Complete Check)
                                          </h3>
                                          <div className="detail-info-card">
                                            <div className="info-item">
                                              <span className="info-label">GST Number</span>
                                              <span className="info-value">
                                                {c.gstNo ? (
                                                  <span className="filled-indicator"><CheckCircle2 size={13} /> {c.gstNo}</span>
                                                ) : (
                                                  <span className="blank-placeholder">— Empty —</span>
                                                )}
                                              </span>
                                            </div>
                                            <div className="info-item">
                                              <span className="info-label">PAN Number</span>
                                              <span className="info-value">
                                                {c.panNo ? (
                                                  <span className="filled-indicator"><CheckCircle2 size={13} /> {c.panNo}</span>
                                                ) : (
                                                  <span className="blank-placeholder">— Empty —</span>
                                                )}
                                              </span>
                                            </div>
                                            <div className="info-item">
                                              <span className="info-label">Registration No</span>
                                              <span className="info-value">
                                                {c.registrationNo ? (
                                                  <span className="filled-indicator"><CheckCircle2 size={13} /> {c.registrationNo}</span>
                                                ) : (
                                                  <span className="blank-placeholder">— Empty —</span>
                                                )}
                                              </span>
                                            </div>
                                            <div className="info-item">
                                              <span className="info-label">Country</span>
                                              <span className="info-value">
                                                {c.country ? c.country : <span className="blank-placeholder">— Empty —</span>}
                                              </span>
                                            </div>
                                            <div className="info-item">
                                              <span className="info-label">State</span>
                                              <span className="info-value">
                                                {c.state ? c.state : <span className="blank-placeholder">— Empty —</span>}
                                              </span>
                                            </div>
                                            <div className="info-item">
                                              <span className="info-label">City</span>
                                              <span className="info-value">
                                                {c.city ? c.city : <span className="blank-placeholder">— Empty —</span>}
                                              </span>
                                            </div>
                                            <div className="info-item">
                                              <span className="info-label">Pincode</span>
                                              <span className="info-value">
                                                {c.pincode ? c.pincode : <span className="blank-placeholder">— Empty —</span>}
                                              </span>
                                            </div>
                                            <div className="info-item">
                                              <span className="info-label">Subscription Plan</span>
                                              <span className="info-value">
                                                <span className="badge info">{c.subscriptionPlanName || 'Free'}</span>
                                              </span>
                                            </div>
                                            <div className="info-item full-width">
                                              <span className="info-label">Main Office Address</span>
                                              <span className="info-value">
                                                {c.address ? (
                                                  <span style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                                    <MapPin size={14} style={{ color: 'var(--primary)', marginTop: '3px' }} />
                                                    {c.address}
                                                  </span>
                                                ) : (
                                                  <span className="blank-placeholder">— Empty —</span>
                                                )}
                                              </span>
                                            </div>
                                            <div className="info-item full-width">
                                              <span className="info-label">Company Logo Check</span>
                                              <span className="info-value">
                                                {c.logo?.url ? (
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                                                    <div className="company-logo-preview">
                                                      <img src={getLogoUrl(c.logo.url)} alt="" />
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: 'var(--success)' }}>Logo File Uploaded (System Verified)</span>
                                                  </div>
                                                ) : (
                                                  <span className="blank-placeholder">— No Logo Uploaded —</span>
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Company Signup users panel list */}
                                        <div className="detail-section">
                                          <h3 className="detail-section-title">
                                            <Users size={16} />
                                            Registered Users ({c.users?.length || 0})
                                          </h3>
                                          <div className="table-container" style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg-secondary)', padding: '4px' }}>
                                            <table className="user-list-table">
                                              <thead>
                                                <tr>
                                                  <th>User Name</th>
                                                  <th>Email Address</th>
                                                  <th>Mobile No</th>
                                                  <th>Status</th>
                                                  <th>Role Type</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {c.users && c.users.length > 0 ? (
                                                  c.users.map((usr) => (
                                                    <tr key={usr.id}>
                                                      <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                                                          <User size={13} style={{ color: 'var(--text-secondary)' }} />
                                                          {usr.name}
                                                        </div>
                                                      </td>
                                                      <td>{usr.email}</td>
                                                      <td>{usr.mobileNo || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                                      <td>
                                                        <span className={`badge ${usr.status === 'Active' ? 'success' : 'warning'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                                          {usr.status}
                                                        </span>
                                                      </td>
                                                      <td>
                                                        {usr.isOwner ? (
                                                          <span className="badge success" style={{ fontSize: '9px', padding: '2px 4px', background: 'var(--accent-bg)', color: 'var(--primary)', border: '1.5px solid var(--border-color)' }}>
                                                            <ShieldCheck size={10} style={{ marginRight: '2px' }} /> Owner / Creator
                                                          </span>
                                                        ) : (
                                                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Company Member</span>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  ))
                                                ) : (
                                                  <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                                                      No user accounts linked.
                                                    </td>
                                                  </tr>
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Profile/Avatar Setup Option Modal */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Superadmin Profile Settings</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Profile Logo Avatar Mock */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {editAvatarUrl ? (
                  <div className="company-logo-preview" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--primary)', padding: '2px' }}>
                    <img src={editAvatarUrl} alt="" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '28px', borderRadius: '50%' }}>
                    {editName.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Superadmin Icon Preview</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>FULL NAME</label>
                <input
                  type="text"
                  required
                  className="search-input"
                  style={{ padding: '8px 12px' }}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>EMAIL ADDRESS (Read Only)</label>
                <input
                  type="email"
                  disabled
                  className="search-input"
                  style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', cursor: 'not-allowed' }}
                  value={adminProfile.email}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>AVATAR IMAGE FILE</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                    id="avatar-file-upload"
                  />
                  <label
                    htmlFor="avatar-file-upload"
                    className="btn btn-ghost"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      margin: 0
                    }}
                  >
                    <Camera size={14} />
                    {uploading ? 'Uploading...' : 'Choose Local File'}
                  </label>
                  {editAvatarUrl && (
                    <span style={{ fontSize: '11px', color: 'var(--success)', wordBreak: 'break-all' }}>
                      Selected: {editAvatarUrl.substring(editAvatarUrl.lastIndexOf('/') + 1)}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Upload a file from your computer to store in the server uploads directory.</span>
              </div>



              <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowProfileModal(false)}
                  style={{ padding: '8px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 14px', background: 'var(--primary)', color: 'white', border: 'none' }}
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Fallback Toast Notification */}
      {toast && (
        <div className="premium-toast">
          <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default App;
