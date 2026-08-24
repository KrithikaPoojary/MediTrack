import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * @param {Array} allowedRoles - Allowed user roles (e.g. ['patient'], ['caregiver'])
 * @param {ReactNode} children - Component to render if authorized
 * @param {Function} onUnauthorized - Callback to switch view to login
 */
const ProtectedRoute = ({ allowedRoles, children, onUnauthorized }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        Loading MediTrack session...
      </div>
    );
  }

  if (!user) {
    if (onUnauthorized) onUnauthorized();
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Authentication Required</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0' }}>Please log in to access this page.</p>
        <button
          onClick={onUnauthorized}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Access Restricted</h2>
        <p style={{ color: '#ef4444', margin: '1rem 0' }}>
          Your role ({user.role}) is not authorized to view this page.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
