import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function MainApp() {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('login');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
        Loading MediTrack...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ padding: '2rem 1rem' }}>
        {!user ? (
          activeTab === 'login' ? (
            <Login
              switchToRegister={() => setActiveTab('register')}
              onSuccess={(u) => console.log('Logged in as:', u.name)}
            />
          ) : (
            <Register
              switchToLogin={() => setActiveTab('login')}
              onSuccess={(u) => console.log('Registered as:', u.name)}
            />
          )
        ) : (
          <div>
            {user.role === 'patient' ? (
              <ProtectedRoute allowedRoles={['patient']}>
                <div style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center' }}>
                  <div
                    style={{
                      padding: '2rem',
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                    }}
                  >
                    <span style={{ fontSize: '2.5rem' }}>💊</span>
                    <h2 style={{ color: '#38bdf8', marginTop: '0.5rem' }}>
                      Welcome, {user.name}! (Patient Dashboard)
                    </h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                      Your authentication is successful. (Step 10 will build the full Medication Management UI here).
                    </p>
                    {user.inviteCode && (
                      <div
                        style={{
                          marginTop: '1.5rem',
                          display: 'inline-block',
                          padding: '0.75rem 1.25rem',
                          backgroundColor: '#0f172a',
                          border: '1px dashed #0284c7',
                          borderRadius: '8px',
                        }}
                      >
                        <strong>Your Caregiver Invite Code:</strong>{' '}
                        <span style={{ color: '#38bdf8', fontSize: '1.1rem', letterSpacing: '2px' }}>
                          {user.inviteCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </ProtectedRoute>
            ) : (
              <ProtectedRoute allowedRoles={['caregiver']}>
                <div style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center' }}>
                  <div
                    style={{
                      padding: '2rem',
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                    }}
                  >
                    <span style={{ fontSize: '2.5rem' }}>🩺</span>
                    <h2 style={{ color: '#a78bfa', marginTop: '0.5rem' }}>
                      Welcome, {user.name}! (Caregiver Dashboard)
                    </h2>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                      Your authentication is successful. (Step 11 will build the Linked Patients & Adherence Chart UI here).
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
