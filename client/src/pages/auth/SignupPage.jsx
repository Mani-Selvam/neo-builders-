import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    mobileNo: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Building2 size={26} />
          <span>NeoBuilder ERP</span>
        </div>
        <h1>Create your company</h1>
        <p className="auth-subtitle">Set up your construction ERP workspace in minutes</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" required placeholder="Acme Construction Pvt Ltd" value={form.companyName} onChange={update('companyName')} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Person</label>
              <input type="text" required placeholder="John Doe" value={form.contactPerson} onChange={update('contactPerson')} />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="text" required placeholder="9876543210" value={form.mobileNo} onChange={update('mobileNo')} />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required placeholder="you@company.com" value={form.email} onChange={update('email')} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Password</label>
              <input type="password" required minLength={6} placeholder="••••••••" value={form.password} onChange={update('password')} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" required minLength={6} placeholder="••••••••" value={form.confirmPassword} onChange={update('confirmPassword')} />
            </div>
          </div>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })}
            />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </label>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
