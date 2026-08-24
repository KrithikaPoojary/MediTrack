import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Register = ({ switchToLogin, onSuccess }) => {
  const { register, error, setError } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const userData = await register(name, email, password, role);
      if (onSuccess) onSuccess(userData);
    } catch (err) {
      // Error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '440px',
        margin: '2.5rem auto',
        padding: '2rem',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
          Create an Account
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Join MediTrack as a Patient or Caregiver</p>
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
        <div style={{ marginBottom: '1.15rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        <div style={{ marginBottom: '1.15rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
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

        <div style={{ marginBottom: '1.15rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="At least 6 characters"
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
            I am registering as:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setRole('patient')}
              style={{
                padding: '0.65rem',
                backgroundColor: role === 'patient' ? '#0284c7' : '#0f172a',
                color: role === 'patient' ? '#ffffff' : '#94a3b8',
                border: `1px solid ${role === 'patient' ? '#0284c7' : '#334155'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
              }}
            >
              💊 Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('caregiver')}
              style={{
                padding: '0.65rem',
                backgroundColor: role === 'caregiver' ? '#7c3aed' : '#0f172a',
                color: role === 'caregiver' ? '#ffffff' : '#94a3b8',
                border: `1px solid ${role === 'caregiver' ? '#7c3aed' : '#334155'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
              }}
            >
              🩺 Caregiver
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: role === 'caregiver' ? '#7c3aed' : '#0284c7',
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
          {submitting ? 'Creating Account...' : 'Register Account'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
        Already have an account?{' '}
        <button
          onClick={switchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#38bdf8',
            cursor: 'pointer',
            fontWeight: '600',
            padding: 0,
          }}
        >
          Log in here
        </button>
      </div>
    </div>
  );
};

export default Register;
