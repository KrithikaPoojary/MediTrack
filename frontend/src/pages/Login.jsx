import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Login = ({ switchToRegister, onSuccess }) => {
  const { login, error, setError } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await login(email, password);
      if (onSuccess) onSuccess(userData);
    } catch (err) {
      // Error is handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '3rem auto',
        padding: '2rem',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
          Welcome Back
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Log in to access your MediTrack dashboard</p>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#450a0a',
            border: '1px solid #991b1b',
            borderRadius: '6px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="patient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.95rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            transition: 'background-color 0.2s',
          }}
        >
          {submitting ? 'Logging in...' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
        Don't have an account?{' '}
        <button
          onClick={switchToRegister}
          style={{
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            cursor: 'pointer',
            fontWeight: '600',
            padding: 0,
          }}
        >
          Register here
        </button>
      </div>
    </div>
  );
};

export default Login;
