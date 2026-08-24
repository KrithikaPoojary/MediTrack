import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import CaregiverDashboard from './pages/CaregiverDashboard';
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
                <PatientDashboard />
              </ProtectedRoute>
            ) : (
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverDashboard />
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
