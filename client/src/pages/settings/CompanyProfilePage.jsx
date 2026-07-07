import { useEffect, useState } from 'react';
import { companyApi } from '../../api/masterApi';
import { useToast } from '../../contexts/ToastContext';

import { useAuth } from '../../contexts/AuthContext';

const FIELDS = [
  { name: 'companyName', label: 'Company Name', required: true },
  { name: 'gstNo', label: 'GST No' },
  { name: 'panNo', label: 'PAN No' },
  { name: 'registrationNo', label: 'Registration No' },
  { name: 'contactPerson', label: 'Contact Person' },
  { name: 'mobileNo', label: 'Mobile No' },
  { name: 'email', label: 'Email' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'country', label: 'Country' },
  { name: 'pincode', label: 'Pincode' },
];

export default function CompanyProfilePage() {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    companyApi
      .getProfile()
      .then(({ data }) => setCompany(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (name, value) => setCompany((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await companyApi.updateProfile(company);
      setCompany(data.data);
      toast.success('Company profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const uploadLogoFile = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const { data } = await companyApi.uploadLogo(formData);
      setCompany(data.data);
      await refreshUser();
      toast.success('Logo uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoUpload = (e) => uploadLogoFile(e.target.files?.[0]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    uploadLogoFile(e.dataTransfer.files?.[0]);
  };

  // Helper to build absolute URL for logo images
  const getLogoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    const cleanPath = url.replace(/^\//, '').replace(/^\/?/, '');
    return `${base}/${cleanPath}`;
  };

  if (loading) return <div className="table-loading">Loading…</div>;

  const completion = company?.profileCompletionPercentage ?? 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Company Profile</h1>
          <p className="page-subtitle">Manage your organization's details and identity</p>
        </div>
      </div>

      <div className="profile-completion-card">
        <div className="profile-completion-header">
          <span>Profile Completion</span>
          <strong>{completion}%</strong>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <form className="table-card" onSubmit={handleSubmit}>
        <div className="modal-body" style={{ padding: '24px' }}>
          <label 
            className="logo-upload-section" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', 
              cursor: 'pointer', padding: '16px', border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`, 
              borderRadius: '12px', transition: 'background 0.2s, border-color 0.2s',
              background: isDragging ? 'var(--bg-hover)' : 'transparent'
            }}
            onMouseOver={(e) => { if(!isDragging) e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseOut={(e) => { if(!isDragging) e.currentTarget.style.background = 'transparent'; }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={{ width: '120px', height: '120px', overflow: 'hidden' }}>
              <img src={company?.logo?.url ? getLogoUrl(company.logo.url) : ''} alt="Company Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div className="btn" style={{ pointerEvents: 'none', display: 'inline-block' }}>
                {uploadingLogo ? 'Uploading...' : 'Click to Upload Logo'}
              </div>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={uploadingLogo} />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', pointerEvents: 'none', margin: '8px 0 0 0' }}>Recommended size: 256x256. Max 2MB.</p>
            </div>
          </label>

          <div className="form-grid">
            {FIELDS.map((f) => (
              <div key={f.name} className="form-group">
                <label>
                  {f.label}
                  {f.required && <span className="required-mark">*</span>}
                </label>
                <input
                  className="form-input"
                  required={f.required}
                  value={company?.[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              </div>
            ))}
            <div className="form-group span-2">
              <label>Address</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={company?.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
