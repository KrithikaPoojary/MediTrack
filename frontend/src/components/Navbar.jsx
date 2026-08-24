import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem' }}>💊</span>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#38bdf8', fontWeight: '700' }}>
          MediTrack
        </h2>
      </div>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '12px',
                  backgroundColor: user.role === 'caregiver' ? '#7c3aed' : '#0284c7',
                  color: '#fff',
                  textTransform: 'capitalize',
                }}
              >
                {user.role}
              </span>
              {user.inviteCode && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    backgroundColor: '#0f172a',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px dashed #475569',
                  }}
                  title="Share this code with your caregiver"
                >
                  Code: <strong>{user.inviteCode}</strong>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              padding: '0.45rem 0.9rem',
              backgroundColor: '#334155',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#475569')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#334155')}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              padding: '0.45rem 0.9rem',
              backgroundColor: activeTab === 'login' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: '1px solid #0284c7',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              padding: '0.45rem 0.9rem',
              backgroundColor: activeTab === 'register' ? '#0284c7' : 'transparent',
              color: '#f8fafc',
              border: '1px solid #0284c7',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            Register
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
