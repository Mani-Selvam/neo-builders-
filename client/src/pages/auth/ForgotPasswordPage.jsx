import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail } from 'lucide-react';
import { authApi } from '../../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
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
        <h1>Forgot password</h1>
        <p className="auth-subtitle">Enter your email and we'll send you reset instructions</p>

        {error && <div className="alert alert-error">{error}</div>}

        {sent ? (
          <div className="alert alert-success">
            If an account exists for {email}, you'll receive password reset instructions shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon">
                <Mail size={16} />
                <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
