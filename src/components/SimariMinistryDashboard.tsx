import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAssessments } from '../contexts/AssessmentContext';
import { mockHospitals, mockRegions, getStageDistribution } from '../data/mockData';
import { Sidebar } from './Sidebar';
import { PengaturanAkses } from './PengaturanAkses';

export function SimariMinistryDashboard() {
  const { user, logout } = useAuth();
  const { assessments } = useAssessments();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const pendingValidation = assessments.filter(
    (a) => a.status === 'reviewed' || a.status === 'under_validation'
  ).length;
  const validated = assessments.filter((a) => a.status === 'validated').length;

  const stageDistribution = getStageDistribution(mockHospitals);
  const nationalAvgStage = mockHospitals.length > 0
    ? (mockHospitals.reduce((sum, h) => sum + h.currentEMRAMStage, 0) / mockHospitals.length).toFixed(1)
    : 0;

  const getStageClass = (stage: number) => `stage-s${stage}`;

  return (
    <div className="simari-app">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} onLogout={logout} />

      <main className="simari-main">
        {currentPage === 'pengaturan' && (
          <PengaturanAkses onLogout={logout} />
        )}
        {currentPage !== 'pengaturan' && <div className="simari-topbar">
          <div className="topbar-title">Dashboard Nasional</div>
          <div className="topbar-actions">
            <button className="simari-btn simari-btn-ghost">
              🔔
              {pendingValidation > 0 && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    background: '#E24B4A',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                  }}
                />
              )}
            </button>
            <button className="simari-btn simari-btn-ghost">⚙</button>
            <button className="simari-btn simari-btn-primary" onClick={() => setCurrentPage('audit')}>
              + Audit Baru
            </button>
          </div>
        </div>}

        {currentPage === 'dashboard' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Selamat pagi, {user?.name?.split(' ')[1] || user?.name} 👋</h1>
              <p>Monitoring kematangan RME seluruh faskes Indonesia — periode audit Q2 2025</p>
            </div>

            {/* National Metrics */}
            <div className="grid-4 mb-20">
              <div className="metric-card">
                <div className="metric-label">Total Faskes</div>
                <div className="metric-value">{mockHospitals.length}</div>
                <div className="metric-change text-muted">Seluruh Indonesia</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Rata-rata Nasional</div>
                <div className="metric-value">{nationalAvgStage}</div>
                <div className="metric-change text-muted">Stage EMRAM</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Perlu Validasi</div>
                <div className="metric-value">{pendingValidation}</div>
                <div className="metric-change text-muted">Assessment menunggu</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Tervalidasi</div>
                <div className="metric-value">{validated}</div>
                <div className="metric-change text-muted">Assessment selesai</div>
              </div>
            </div>

            {/* Distribution and Regional Stats */}
            <div className="grid-2 mb-20">
              <div className="simari-card">
                <div className="card-title">Distribusi Stage EMRAM Nasional</div>
                <div style={{ marginTop: '20px' }}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((stage) => {
                    const count = stageDistribution[stage as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7];
                    const percentage = mockHospitals.length > 0
                      ? (count / mockHospitals.length) * 100
                      : 0;

                    return (
                      <div
                        key={stage}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          marginBottom: '4px',
                        }}
                      >
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: `var(--stage${stage})`,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 500, width: '70px' }}>
                          Stage {stage}
                        </span>
                        <div className="progress-wrap" style={{ flex: 1 }}>
                          <div
                            className="progress-fill"
                            style={{ width: `${percentage}%`, background: `var(--stage${stage})` }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            color: 'var(--text3)',
                            width: '80px',
                            textAlign: 'right',
                          }}
                        >
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="simari-card">
                <div className="card-title">Performance Regional</div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {mockRegions.map((region) => {
                    const regionalHospitals = mockHospitals.filter((h) => h.regionId === region.id);
                    const avgStage =
                      regionalHospitals.length > 0
                        ? (
                            regionalHospitals.reduce((sum, h) => sum + h.currentEMRAMStage, 0) /
                            regionalHospitals.length
                          ).toFixed(1)
                        : '0';

                    return (
                      <div
                        key={region.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>
                            {region.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                            {regionalHospitals.length} faskes
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '18px' }}>
                            {avgStage}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text3)' }}>avg stage</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Verification Queue */}
            <div className="simari-card mb-20">
              <div className="card-title">Antrian Validasi</div>
              {pendingValidation === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                  Tidak ada assessment yang perlu divalidasi saat ini.
                </div>
              ) : (
                <table className="simari-table">
                  <thead>
                    <tr>
                      <th>Faskes</th>
                      <th>Region</th>
                      <th>ID Assessment</th>
                      <th>Target Stage</th>
                      <th>Score</th>
                      <th>Direview Oleh</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments
                      .filter((a) => a.status === 'reviewed' || a.status === 'under_validation')
                      .map((assessment) => (
                        <tr key={assessment.id}>
                          <td style={{ fontWeight: 500 }}>{assessment.hospitalName}</td>
                          <td className="text-sm text-muted">
                            {mockRegions.find((r) => r.id === assessment.regionId)?.name}
                          </td>
                          <td className="text-sm text-muted">{assessment.id}</td>
                          <td>
                            <span className={`stage-badge ${getStageClass(assessment.targetStage)}`}>
                              Stage {assessment.targetStage}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>{assessment.totalScore}%</td>
                          <td className="text-sm text-muted">{assessment.reviewedBy || '-'}</td>
                          <td>
                            <button className="simari-btn simari-btn-outline" style={{ padding: '4px 12px' }}>
                              Validasi
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent Activity */}
            <div className="simari-card">
              <div className="card-title">Aktivitas Terkini</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessments.slice(0, 5).map((assessment) => (
                  <div
                    key={assessment.id}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'var(--accent-light)',
                        color: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      ✦
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                        <strong>{assessment.hospitalName}</strong> submit assessment untuk{' '}
                        <span className={`stage-badge ${getStageClass(assessment.targetStage)}`}>
                          Stage {assessment.targetStage}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>
                        {new Date(assessment.updatedAt).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'faskes' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Direktori Faskes Nasional</h1>
              <p>Database lengkap seluruh faskes Indonesia</p>
            </div>
            <div className="simari-card">
              <table className="simari-table">
                <thead>
                  <tr>
                    <th>Nama Faskes</th>
                    <th>Region</th>
                    <th>Tipe</th>
                    <th>Kota</th>
                    <th>Kapasitas</th>
                    <th>Stage EMRAM</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHospitals.map((hospital) => (
                    <tr key={hospital.id}>
                      <td style={{ fontWeight: 500 }}>{hospital.name}</td>
                      <td className="text-sm text-muted">{hospital.regionName}</td>
                      <td style={{ textTransform: 'capitalize' }}>{hospital.type}</td>
                      <td>{hospital.city}</td>
                      <td>{hospital.bedCount} beds</td>
                      <td>
                        <span className={`stage-badge ${getStageClass(hospital.currentEMRAMStage)}`}>
                          Stage {hospital.currentEMRAMStage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentPage === 'verifikasi' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Antrian Verifikasi</h1>
              <p>Validasi assessment yang telah direview oleh Dinkes</p>
            </div>
            <div className="simari-card">
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>◐</div>
                <h2 className="serif" style={{ fontSize: '20px', marginBottom: '8px' }}>
                  Proses Validasi
                </h2>
                <p className="text-muted">Review dan validasi assessment untuk sertifikasi resmi</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
