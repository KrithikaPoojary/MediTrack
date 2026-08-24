import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CaregiverDashboard = () => {
  const { user } = useContext(AuthContext);

  // Linked Patients state
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientError, setPatientError] = useState(null);

  // Link Patient Form State
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(null);
  const [linkError, setLinkError] = useState(null);

  // Patient Detail State
  const [patientMeds, setPatientMeds] = useState([]);
  const [doseData, setDoseData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Fetch Linked Patients
  const fetchLinkedPatients = async () => {
    setLoadingPatients(true);
    setPatientError(null);
    try {
      const res = await axios.get('/api/caregiver/patients');
      setPatients(res.data);
      if (res.data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(res.data[0]._id);
      }
    } catch (err) {
      setPatientError('Failed to load linked patients.');
    } finally {
      setLoadingPatients(false);
    }
  };

  // Link Patient via Invite Code
  const handleLinkPatient = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    setLinking(true);
    setLinkSuccess(null);
    setLinkError(null);

    try {
      const res = await axios.post('/api/caregiver/link', { inviteCode: inviteCodeInput.trim() });
      setLinkSuccess(res.data.message || 'Patient successfully linked!');
      setInviteCodeInput('');
      fetchLinkedPatients();
      if (res.data.patient) {
        setSelectedPatientId(res.data.patient._id);
      }
    } catch (err) {
      setLinkError(err.response?.data?.message || 'Failed to link patient. Check code.');
    } finally {
      setLinking(false);
    }
  };

  // Fetch Patient Details (Medications & Dose History)
  const fetchPatientDetails = async (patientId) => {
    if (!patientId) return;
    setLoadingDetails(true);
    setDetailError(null);
    try {
      const [medsRes, doseRes] = await Promise.all([
        axios.get(`/api/caregiver/patients/${patientId}/medications`),
        axios.get(`/api/caregiver/patients/${patientId}/doses`),
      ]);
      setPatientMeds(medsRes.data);
      setDoseData(doseRes.data);
    } catch (err) {
      setDetailError('Failed to load patient data.');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchLinkedPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientDetails(selectedPatientId);
    }
  }, [selectedPatientId]);

  const selectedPatient = patients.find((p) => p._id === selectedPatientId);

  // Prepare Chart Data
  const getPieChartData = () => {
    if (!doseData || !doseData.stats) return [];
    return [
      { name: 'Taken', value: doseData.stats.takenDoses, color: '#10b981' },
      { name: 'Missed', value: doseData.stats.missedDoses, color: '#ef4444' },
      { name: 'Pending', value: doseData.stats.pendingDoses, color: '#f59e0b' },
    ].filter((item) => item.value > 0);
  };

  const getBarChartData = () => {
    if (!doseData || !doseData.doseLogs) return [];
    const grouped = {};
    doseData.doseLogs.forEach((log) => {
      const dateStr = new Date(log.scheduledTime).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      if (!grouped[dateStr]) {
        grouped[dateStr] = { date: dateStr, taken: 0, missed: 0, pending: 0 };
      }
      if (log.status === 'taken') grouped[dateStr].taken += 1;
      else if (log.status === 'missed') grouped[dateStr].missed += 1;
      else if (log.status === 'pending') grouped[dateStr].pending += 1;
    });

    return Object.values(grouped).reverse();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          border: '1px solid #334155',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>🩺</span>
            <h1 style={{ color: '#f8fafc', fontSize: '1.75rem', margin: 0 }}>
              Caregiver Command Center
            </h1>
          </div>
          <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0' }}>
            Welcome back, <strong>{user?.name}</strong>! Monitor your patients' real-time medication adherence.
          </p>
        </div>
      </div>

      {/* Grid Layout: Link Patient Form & Patient Selection */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Link New Patient Card */}
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <h3 style={{ color: '#38bdf8', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🔗</span> Link a Patient
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Enter the 6-character invite code provided by your patient.
          </p>

          <form onSubmit={handleLinkPatient} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="e.g. 2AC6Z0"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              maxLength={6}
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '1rem',
                letterSpacing: '2px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            />
            <button
              type="submit"
              disabled={linking || !inviteCodeInput.trim()}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: '600',
                cursor: linking || !inviteCodeInput.trim() ? 'not-allowed' : 'pointer',
                opacity: linking || !inviteCodeInput.trim() ? 0.6 : 1,
              }}
            >
              {linking ? 'Linking...' : 'Link Patient'}
            </button>
          </form>

          {linkSuccess && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#064e3b',
                color: '#34d399',
                borderRadius: '8px',
                fontSize: '0.875rem',
                border: '1px solid #059669',
              }}
            >
              ✓ {linkSuccess}
            </div>
          )}

          {linkError && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                backgroundColor: '#7f1d1d',
                color: '#fca5a5',
                borderRadius: '8px',
                fontSize: '0.875rem',
                border: '1px solid #dc2626',
              }}
            >
              ⚠ {linkError}
            </div>
          )}
        </div>

        {/* Linked Patients List Card */}
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <h3 style={{ color: '#a78bfa', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>👥</span> Your Linked Patients ({patients.length})
          </h3>

          {loadingPatients ? (
            <p style={{ color: '#94a3b8' }}>Loading patients...</p>
          ) : patientError ? (
            <p style={{ color: '#ef4444' }}>{patientError}</p>
          ) : patients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
              <p>No patients linked yet.</p>
              <span style={{ fontSize: '0.85rem' }}>Use the invite code form on the left to link your first patient.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
              {patients.map((p) => {
                const isSelected = p._id === selectedPatientId;
                return (
                  <button
                    key={p._id}
                    onClick={() => setSelectedPatientId(p._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #8b5cf6' : '1px solid #334155',
                      backgroundColor: isSelected ? '#2e1065' : '#0f172a',
                      color: isSelected ? '#c4b5fd' : '#cbd5e1',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div>
                      <div>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.email}</div>
                    </div>
                    {isSelected && <span style={{ color: '#a78bfa' }}>● Active</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Patient Adherence & Details Section */}
      {selectedPatientId && selectedPatient && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section Header */}
          <div style={{ borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
            <h2 style={{ color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📊</span> Monitoring: <span style={{ color: '#38bdf8' }}>{selectedPatient.name}</span>
            </h2>
          </div>

          {loadingDetails ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              Loading patient adherence statistics & medications...
            </div>
          ) : detailError ? (
            <div style={{ color: '#ef4444', padding: '1rem', backgroundColor: '#7f1d1d', borderRadius: '8px' }}>
              {detailError}
            </div>
          ) : (
            <>
              {/* Summary Stats Cards */}
              {doseData?.stats && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {/* Adherence Rate Card */}
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      ADHERENCE RATE
                    </div>
                    <div
                      style={{
                        fontSize: '2.25rem',
                        fontWeight: '800',
                        marginTop: '0.25rem',
                        color:
                          doseData.stats.adherenceRate >= 80
                            ? '#10b981'
                            : doseData.stats.adherenceRate >= 50
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    >
                      {doseData.stats.adherenceRate}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Last 30 Days
                    </div>
                  </div>

                  {/* Total Doses */}
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      TOTAL DOSES
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.25rem', color: '#f8fafc' }}>
                      {doseData.stats.totalDoses}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Scheduled Doses
                    </div>
                  </div>

                  {/* Taken Doses */}
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      TAKEN DOSES
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.25rem', color: '#10b981' }}>
                      {doseData.stats.takenDoses}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Completed
                    </div>
                  </div>

                  {/* Missed Doses */}
                  <div
                    style={{
                      backgroundColor: '#1e293b',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      MISSED DOSES
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: '800', marginTop: '0.25rem', color: '#ef4444' }}>
                      {doseData.stats.missedDoses}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Red Alerts Sent
                    </div>
                  </div>
                </div>
              )}

              {/* Recharts Analytics Section */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {/* Daily Adherence Bar Chart */}
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                  }}
                >
                  <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    📈 Daily Dose Breakdown
                  </h3>
                  {getBarChartData().length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                      No dose history logs available yet.
                    </p>
                  ) : (
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getBarChartData()}>
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                          />
                          <Legend />
                          <Bar dataKey="taken" name="Taken" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="missed" name="Missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Overall Dose Distribution Pie Chart */}
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                  }}
                >
                  <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    🍰 Overall Dose Distribution
                  </h3>
                  {getPieChartData().length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                      No dose data recorded yet.
                    </p>
                  ) : (
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieChartData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {getPieChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Medications List */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                }}
              >
                <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💊</span> Patient's Active Medications ({patientMeds.length})
                </h3>

                {patientMeds.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>Patient has not added any medications yet.</p>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {patientMeds.map((med) => (
                      <div
                        key={med._id}
                        style={{
                          backgroundColor: '#0f172a',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid #334155',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>{med.name}</h4>
                          <span
                            style={{
                              backgroundColor: '#0284c7',
                              color: '#ffffff',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {med.dosage}
                          </span>
                        </div>
                        {med.instructions && (
                          <p style={{ color: '#cbd5e1', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                            <em>"{med.instructions}"</em>
                          </p>
                        )}
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                          ⏰ Scheduled Times:{' '}
                          {med.scheduleTimes?.map((t) => (
                            <span
                              key={t}
                              style={{
                                display: 'inline-block',
                                backgroundColor: '#1e293b',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                marginLeft: '0.3rem',
                                border: '1px solid #475569',
                                color: '#f8fafc',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dose History Logs Table */}
              <div
                style={{
                  backgroundColor: '#1e293b',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                }}
              >
                <h3 style={{ color: '#f8fafc', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📋</span> Detailed Dose History Log
                </h3>

                {(!doseData?.doseLogs || doseData.doseLogs.length === 0) ? (
                  <p style={{ color: '#94a3b8' }}>No dose history recorded for this period.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        color: '#f8fafc',
                        fontSize: '0.9rem',
                      }}
                    >
                      <thead>
                        <tr style={{ borderBottom: '2px solid #334155', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 0.5rem', color: '#94a3b8' }}>Medication</th>
                          <th style={{ padding: '0.75rem 0.5rem', color: '#94a3b8' }}>Scheduled Time</th>
                          <th style={{ padding: '0.75rem 0.5rem', color: '#94a3b8' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doseData.doseLogs.map((log) => {
                          const dateObj = new Date(log.scheduledTime);
                          const dateStr = dateObj.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                          const timeStr = dateObj.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          });

                          let badgeColor = '#f59e0b';
                          let badgeBg = '#78350f';
                          if (log.status === 'taken') {
                            badgeColor = '#34d399';
                            badgeBg = '#064e3b';
                          } else if (log.status === 'missed') {
                            badgeColor = '#fca5a5';
                            badgeBg = '#7f1d1d';
                          }

                          return (
                            <tr key={log._id} style={{ borderBottom: '1px solid #1e293b' }}>
                              <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>
                                {log.medication?.name || 'Medication'}{' '}
                                <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                  ({log.medication?.dosage})
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', color: '#cbd5e1' }}>
                                {dateStr} at {timeStr}
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                <span
                                  style={{
                                    backgroundColor: badgeBg,
                                    color: badgeColor,
                                    padding: '0.25rem 0.6rem',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CaregiverDashboard;
