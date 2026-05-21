import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAssessments } from '../contexts/AssessmentContext';
import { mockHospitals } from '../data/mockData';
import { allFaskes } from '../data/visualisasiData';
import { Sidebar } from './Sidebar';
import { InstrumentEMRAM } from './InstrumentEMRAM';
import { AuditBaruEMRAM } from './AuditBaruEMRAM';
import { PengaturanAkses } from './PengaturanAkses';
import { RiwayatAssessment } from './RiwayatAssessment';
import { AnalisisKematangan } from './AnalisisKematangan';

export function SimariHospitalDashboard() {
  const { user, logout } = useAuth();
  const { assessments, getAssessmentsByHospital } = useAssessments();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const hospital = mockHospitals.find((h) => h.id === user?.organizationId);
  const hospitalAssessments = getAssessmentsByHospital(user?.organizationId || '');

  const draftCount = hospitalAssessments.filter((a) => a.status === 'draft').length;
  const reviewCount = hospitalAssessments.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  ).length;
  const validatedCount = hospitalAssessments.filter((a) => a.status === 'validated').length;

  const getStageClass = (stage: number) => `stage-s${stage}`;

  return (
    <div className="simari-app">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} onLogout={logout} />

      <main className="simari-main">
        {currentPage !== 'instrument' && currentPage !== 'audit' && currentPage !== 'pengaturan' && (
          <div className="simari-topbar">
            <div className="topbar-title">Dashboard</div>
            <div className="topbar-actions">
              <button className="simari-btn simari-btn-ghost">🔔</button>
              <button className="simari-btn simari-btn-ghost">⚙</button>
            </div>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Selamat datang, {user?.name?.split(' ')[0]} 👋</h1>
              <p>Self-assessment EMRAM untuk {hospital?.name}</p>
            </div>

            {/* Metrics */}
            <div className="grid-4 mb-20">
              <div className="metric-card">
                <div className="metric-label">Stage EMRAM Saat Ini</div>
                <div className="metric-value">{hospital?.currentEMRAMStage}</div>
                <div className="metric-change">
                  <span className={getStageClass(hospital?.currentEMRAMStage || 0)}>
                    ● Stage {hospital?.currentEMRAMStage}
                  </span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Draft Assessment</div>
                <div className="metric-value">{draftCount}</div>
                <div className="metric-change text-muted">Belum disubmit</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Dalam Review</div>
                <div className="metric-value">{reviewCount}</div>
                <div className="metric-change text-muted">Menunggu verifikasi</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Tervalidasi</div>
                <div className="metric-value">{validatedCount}</div>
                <div className="metric-change text-muted">Sudah terverifikasi</div>
              </div>
            </div>

            {/* Progress Kematangan RME — full width */}
            {(() => {
              const stageDescriptions: Record<number, string> = {
                0: 'Belum ada sistem digital — data klinis masih paper-based',
                1: 'Sistem ancillary terpasang — LIS, RIS, dan Farmasi aktif',
                2: 'CDR & Terminologi — data terhimpun, coding diagnosis & prosedur',
                3: 'Dokumentasi Klinis — catatan perawat dan eMedicrec elektronik',
                4: 'CPOE & CDS — order elektronik + clinical decision support',
                5: 'Closed Loop — verifikasi obat dan dokumentasi lengkap terverifikasi',
                6: 'Teknologi Lanjutan — analitik klinis dan data warehouse aktif',
                7: 'Paperless — rekam medis penuh digital dengan HIE nasional',
              };
              const current = hospital?.currentEMRAMStage ?? 0;
              return (
                <div className="simari-card mb-20">
                  <div className="card-title">Progress Kematangan RME</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                    {[0,1,2,3,4,5,6,7].map((stage) => {
                      const isCurrent = stage === current;
                      const isPast = stage < current;
                      const isNext = stage === current + 1;
                      return (
                        <div
                          key={stage}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '10px 14px', borderRadius: '8px',
                            background: isCurrent ? 'var(--accent-light)' : isPast ? 'var(--surface2)' : 'transparent',
                            border: isCurrent ? '1px solid var(--accent)' : '1px solid transparent',
                          }}
                        >
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                            background: isPast ? 'var(--accent)' : isCurrent ? 'var(--accent)' : 'var(--surface2)',
                            border: `2px solid ${isPast || isCurrent ? 'var(--accent)' : 'var(--border2)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '10px', fontWeight: 700,
                          }}>
                            {isPast ? '✓' : stage}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--accent)' : isPast ? 'var(--text2)' : 'var(--text3)' }}>
                              Stage {stage}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '1px' }}>
                              {stageDescriptions[stage]}
                            </div>
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            {isPast && <span className="status-badge status-done" style={{ fontSize: '10px' }}>✓ Tercapai</span>}
                            {isCurrent && <span className={`stage-badge ${getStageClass(stage)}`}>Stage Saat Ini</span>}
                            {isNext && <span className="status-badge status-review" style={{ fontSize: '10px' }}>Target Berikutnya</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {currentPage === 'instrument' && (
          <InstrumentEMRAM
            hospitalName={hospital?.name || 'RSUD'}
            hospitalStage={hospital?.currentEMRAMStage ?? 4}
            onBack={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'audit' && (
          <AuditBaruEMRAM
            hospitalName={hospital?.name || 'RSUD'}
            hospitalStage={hospital?.currentEMRAMStage || 4}
            onStartAudit={() => setCurrentPage('instrument')}
          />
        )}

        {currentPage === 'riwayat' && (
          <RiwayatAssessment hospitalId={user?.organizationId || ''} />
        )}

        {currentPage === 'analitik' && (
          <AnalisisKematangan
            faskes={allFaskes.filter(f => f.provinsi === (hospital?.regionName?.split(' ')[0] ?? 'DKI Jakarta'))}
            judul="Analisis Kematangan RME"
            subtitle={`Perbandingan tingkat kematangan RME faskes satu wilayah dengan ${hospital?.name}`}
          />
        )}

        {currentPage === 'profil' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Profil Faskes</h1>
              <p>Informasi lengkap tentang {hospital?.name}</p>
            </div>
            <div className="simari-card">
              <div className="card-title">Data Faskes</div>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '12px' }}>
                <span className="text-muted">Nama Lengkap:</span>
                <span style={{ fontWeight: 500 }}>{hospital?.name}</span>
                <span className="text-muted">Tipe Faskes:</span>
                <span style={{ textTransform: 'capitalize' }}>{hospital?.type}</span>
                <span className="text-muted">Kota/Kabupaten:</span>
                <span>{hospital?.city}</span>
                <span className="text-muted">Region:</span>
                <span>{hospital?.regionName}</span>
                <span className="text-muted">Kapasitas Tempat Tidur:</span>
                <span>{hospital?.bedCount} beds</span>
                <span className="text-muted">Stage EMRAM:</span>
                <span className={`stage-badge ${getStageClass(hospital?.currentEMRAMStage || 0)}`}>
                  Stage {hospital?.currentEMRAMStage}
                </span>
                <span className="text-muted">Assessment Terakhir:</span>
                <span>{hospital?.lastAssessmentDate ? new Date(hospital.lastAssessmentDate).toLocaleDateString('id-ID') : '—'}</span>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'pengaturan' && (
          <PengaturanAkses onLogout={logout} />
        )}
      </main>
    </div>
  );
}
