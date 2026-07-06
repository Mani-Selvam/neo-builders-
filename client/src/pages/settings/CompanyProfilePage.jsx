import { useEffect, useState } from 'react';
import { companyApi } from '../../api/masterApi';
import { useToast } from '../../contexts/ToastContext';

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
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
