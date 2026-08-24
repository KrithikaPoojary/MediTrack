import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeSubTab, setActiveSubTab] = useState('doses'); // 'doses' or 'medications'

  // Today's Doses State
  const [todayDoses, setTodayDoses] = useState([]);
  const [loadingDoses, setLoadingDoses] = useState(true);
  const [doseError, setDoseError] = useState(null);

  // Medications State
  const [medications, setMedications] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [medError, setMedError] = useState(null);

  // Modal / Form State
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    instructions: '',
    time1: '08:00',
    time2: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch Today's Doses
  const fetchTodayDoses = async () => {
    setLoadingDoses(true);
    setDoseError(null);
    try {
      const res = await axios.get('/api/doses/today');
      setTodayDoses(res.data);
    } catch (err) {
      setDoseError('Failed to load today\'s dose schedule.');
    } finally {
      setLoadingDoses(false);
    }
  };

  // Fetch Medications
  const fetchMedications = async () => {
    setLoadingMeds(true);
    setMedError(null);
    try {
      const res = await axios.get('/api/medications');
      setMedications(res.data);
    } catch (err) {
      setMedError('Failed to load medications.');
    } finally {
      setLoadingMeds(false);
    }
  };

  useEffect(() => {
    fetchTodayDoses();
    fetchMedications();
  }, []);

  // Handle Mark as Taken
  const handleMarkTaken = async (doseId) => {
    try {
      await axios.put(`/api/doses/${doseId}/taken`);
      fetchTodayDoses(); // Refresh today's doses
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark dose as taken.');
    }
  };

  // Open Modal for Add / Edit
  const openAddModal = () => {
    setEditingMed(null);
    setFormData({ name: '', dosage: '', instructions: '', time1: '08:00', time2: '' });
    setShowModal(true);
  };

  const openEditModal = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      instructions: med.instructions || '',
      time1: med.scheduleTimes[0] || '08:00',
      time2: med.scheduleTimes[1] || '',
    });
    setShowModal(true);
  };

  // Submit Add / Edit Medication Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    const scheduleTimes = [formData.time1];
    if (formData.time2) scheduleTimes.push(formData.time2);

    const payload = {
      name: formData.name,
      dosage: formData.dosage,
      instructions: formData.instructions,
      scheduleTimes,
    };

    try {
      if (editingMed) {
        await axios.put(`/api/medications/${editingMed._id}`, payload);
      } else {
        await axios.post('/api/medications', payload);
      }
      setShowModal(false);
      fetchMedications();
      fetchTodayDoses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save medication.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Medication
  const handleDeleteMedication = async (medId) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await axios.delete(`/api/medications/${medId}`);
        fetchMedications();
        fetchTodayDoses();
      } catch (err) {
        alert('Failed to delete medication.');
      }
    }
  };

  // Stats calculation
  const takenCount = todayDoses.filter((d) => d.status === 'taken').length;
  const totalCount = todayDoses.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '1rem' }}>
      {/* Top Banner with Patient Info & Invite Code */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
            Hello, {user?.name} 👋
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Track your daily medications and maintain your health adherence.
          </p>
        </div>

        {user?.inviteCode && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#0f172a',
              border: '1px dashed #0284c7',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              Caregiver Invite Code
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#38bdf8', letterSpacing: '2px' }}>
              {user.inviteCode}
            </div>
          </div>
        )}
      </div>

      {/* Today's Progress Bar */}
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: '#cbd5e1' }}>Today's Adherence Progress</span>
          <span style={{ fontWeight: '700', color: '#38bdf8' }}>{progressPercent}% ({takenCount}/{totalCount} doses)</span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: '#0f172a', borderRadius: '5px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: '#0284c7',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveSubTab('doses')}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: activeSubTab === 'doses' ? '#0284c7' : 'transparent',
            color: activeSubTab === 'doses' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          📋 Today's Dose Schedule
        </button>
        <button
          onClick={() => setActiveSubTab('medications')}
          style={{
            padding: '0.6rem 1.2rem',
            backgroundColor: activeSubTab === 'medications' ? '#0284c7' : 'transparent',
            color: activeSubTab === 'medications' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          💊 My Medications ({medications.length})
        </button>
      </div>

      {/* TAB 1: TODAY'S DOSES */}
      {activeSubTab === 'doses' && (
        <div>
          {loadingDoses ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading today's doses...</div>
          ) : doseError ? (
            <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{doseError}</div>
          ) : todayDoses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '2rem' }}>⏰</span>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
                No scheduled doses for today yet. Doses will appear when your medication schedule times arrive!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todayDoses.map((dose) => {
                const scheduledFormatted = new Date(dose.scheduledTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={dose._id}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.25rem',
                      backgroundColor: '#1e293b',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      borderLeft: `5px solid ${
                        dose.status === 'taken' ? '#22c55e' : dose.status === 'missed' ? '#ef4444' : '#3b82f6'
                      }`,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                          {dose.medication?.name || 'Medication'}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            backgroundColor:
                              dose.status === 'taken' ? '#14532d' : dose.status === 'missed' ? '#7f1d1d' : '#1e3a8a',
                            color:
                              dose.status === 'taken' ? '#4ade80' : dose.status === 'missed' ? '#fca5a5' : '#93c5fd',
                          }}
                        >
                          {dose.status}
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Dosage: {dose.medication?.dosage} • Scheduled: <strong>{scheduledFormatted}</strong>
                      </p>
                      {dose.medication?.instructions && (
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                          Note: {dose.medication.instructions}
                        </p>
                      )}
                    </div>

                    <div>
                      {dose.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkTaken(dose._id)}
                          style={{
                            padding: '0.6rem 1.2rem',
                            backgroundColor: '#22c55e',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                        >
                          ✓ Mark as Taken
                        </button>
                      ) : dose.status === 'taken' ? (
                        <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.9rem' }}>
                          ✓ Taken at {new Date(dose.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.9rem' }}>
                          ✖ Missed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY MEDICATIONS */}
      {activeSubTab === 'medications' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#f8fafc' }}>Active Medication List</h3>
            <button
              onClick={openAddModal}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              + Add Medication
            </button>
          </div>

          {loadingMeds ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading medications...</div>
          ) : medError ? (
            <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem' }}>{medError}</div>
          ) : medications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '2rem' }}>💊</span>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>No active medications found.</p>
              <button
                onClick={openAddModal}
                style={{
                  marginTop: '1rem',
                  padding: '0.6rem 1.2rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + Add Your First Medication
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {medications.map((med) => (
                <div
                  key={med._id}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.1rem', color: '#38bdf8', marginBottom: '0.25rem' }}>{med.name}</h4>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Dosage: <strong>{med.dosage}</strong>
                    </p>
                    {med.instructions && (
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        Instructions: {med.instructions}
                      </p>
                    )}
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                        Scheduled Times:
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {med.scheduleTimes.map((time, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#0f172a',
                              color: '#38bdf8',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #334155',
                            }}
                          >
                            ⏰ {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #334155' }}>
                    <button
                      onClick={() => openEditModal(med)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        backgroundColor: '#334155',
                        color: '#f8fafc',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMedication(med._id)}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        backgroundColor: '#7f1d1d',
                        color: '#fca5a5',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT MEDICATION MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '450px',
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #334155',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '1rem' }}>
              {editingMed ? 'Edit Medication' : 'Add New Medication'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Medication Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lisinopril, Metformin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Dosage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10mg, 1 tablet"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take with water after breakfast"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Daily Schedule Times (24-hour HH:mm)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Time 1 (Required)</span>
                    <input
                      type="time"
                      value={formData.time1}
                      onChange={(e) => setFormData({ ...formData, time1: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Time 2 (Optional)</span>
                    <input
                      type="time"
                      value={formData.time2}
                      onChange={(e) => setFormData({ ...formData, time2: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: formSubmitting ? 'not-allowed' : 'pointer',
                    opacity: formSubmitting ? 0.7 : 1,
                  }}
                >
                  {formSubmitting ? 'Saving...' : editingMed ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
