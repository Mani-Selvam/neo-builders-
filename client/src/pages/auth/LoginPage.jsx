import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-brand">
            <Building2 size={26} />
            <span>Realnest</span>
          </div>
          <div className="auth-hero-text">
            <h2>Find your sweet home</h2>
            <p>Schedule visit in just a few clicks</p>
            <p>visits in just a few clicks</p>
            <div className="auth-hero-dots">
              <div className="auth-hero-dot active"></div>
              <div className="auth-hero-dot"></div>
              <div className="auth-hero-dot"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-form-side">
        <div className="auth-card">
          <h1>Welcome Back to Realnest!</h1>
          <p className="auth-subtitle">Sign in your account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Email</label>
              <div className="input-icon">
                <input
                  type="email"
                  required
                  placeholder="info.madhu786@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="input-icon-btn" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="auth-links-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="checkbox-row" style={{ marginBottom: 0 }}>
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" style={{ color: '#94a3b8' }}>Forgot Password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-block auth-submit-btn" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>

            {/*
            <div className="auth-divider">
              <span>Instant Login</span>
            </div>

            <div className="auth-social-row">
              <button type="button" className="btn-social">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="18" />
                Continue with Google
              </button>
              <button type="button" className="btn-social">
                <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" width="18" />
                Continue with Facebook
              </button>
            </div>
            */}
          </form>

          <p className="auth-footer">
            Don't have any account? <Link to="/signup">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
