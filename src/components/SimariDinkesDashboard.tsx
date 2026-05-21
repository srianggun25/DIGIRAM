import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAssessments } from '../contexts/AssessmentContext';
import { mockHospitals, mockRegions, getStageDistribution } from '../data/mockData';
import { allFaskes } from '../data/visualisasiData';
import { STAGE_COLORS } from '../data/visualisasiData';
import { Sidebar } from './Sidebar';
import { PengaturanAkses } from './PengaturanAkses';
import { AnalisisKematangan } from './AnalisisKematangan';
import { PetaProvinsi } from './PetaProvinsi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Cell,
} from 'recharts';

export function SimariDinkesDashboard() {
  const { user, logout } = useAuth();
  const { assessments, getAssessmentsByRegion } = useAssessments();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Filter controls for national faskes tab
  const [fnSearch, setFnSearch] = useState('');
  const [fnProvinsi, setFnProvinsi] = useState('');
  const [fnKabupaten, setFnKabupaten] = useState('');
  const [fnStage, setFnStage] = useState<number | null>(null);
  const [fnStatus, setFnStatus] = useState('');

  const region = mockRegions.find((r) => r.id === user?.regionId);
  const regionalHospitals = mockHospitals.filter((h) => h.regionId === user?.regionId);

  const regionToProvinsi: Record<string, string> = {
    'r-diy': 'DI Yogyakarta',
  };
  const provinsiFilter = user?.regionId ? regionToProvinsi[user.regionId] ?? null : null;
  const regionalFaskes = provinsiFilter
    ? allFaskes.filter(f => f.provinsi === provinsiFilter)
    : allFaskes;

  const regionalAssessments = getAssessmentsByRegion(user?.regionId || '');
  const pendingVerification = regionalAssessments.filter(
    (a) => a.status === 'submitted' || a.status === 'under_review'
  ).length;
  const verified = regionalAssessments.filter((a) => a.status === 'reviewed').length;

  const stageDistribution = getStageDistribution(regionalHospitals);
  const avgStage = regionalHospitals.length > 0
    ? (regionalHospitals.reduce((sum, h) => sum + h.currentEMRAMStage, 0) / regionalHospitals.length).toFixed(1)
    : '0';

  const stageChartData = [0, 1, 2, 3, 4, 5, 6, 7].map(s => ({
    name: `S${s}`,
    count: stageDistribution[s as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7],
    fill: STAGE_COLORS[s],
  }));

  // National faskes filters
  const provinsiList = useMemo(() => Array.from(new Set(allFaskes.map(f => f.provinsi))).sort(), []);
  const kabupatenList = useMemo(() => {
    const base = fnProvinsi ? allFaskes.filter(f => f.provinsi === fnProvinsi) : allFaskes;
    return Array.from(new Set(base.map(f => f.kabupaten))).sort();
  }, [fnProvinsi]);

  const filteredNasional = useMemo(() => {
    let data = allFaskes;
    if (fnSearch) data = data.filter(f => f.nama.toLowerCase().includes(fnSearch.toLowerCase()) || f.kabupaten.toLowerCase().includes(fnSearch.toLowerCase()));
    if (fnProvinsi) data = data.filter(f => f.provinsi === fnProvinsi);
    if (fnKabupaten) data = data.filter(f => f.kabupaten === fnKabupaten);
    if (fnStage !== null) data = data.filter(f => f.stageEMRAM === fnStage);
    if (fnStatus) data = data.filter(f => f.statusAssessment === fnStatus);
    return data;
  }, [fnSearch, fnProvinsi, fnKabupaten, fnStage, fnStatus]);

  const getStageClass = (stage: number) => `stage-s${stage}`;

  const inputStyle: React.CSSProperties = {
    fontSize: '12px', padding: '6px 10px', borderRadius: '6px',
    border: '1px solid var(--border2)', background: 'var(--surface)',
    color: 'var(--text)', fontFamily: "'Plus Jakarta Sans', sans-serif",
    outline: 'none',
  };

  const statusColor: Record<string, string> = {
    'Tervalidasi': '#15804D',
    'Dalam Review': '#F59E0B',
    'Draft': '#6B7280',
    'Belum': '#EF4444',
  };

  return (
    <div className="simari-app">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} onLogout={logout} />

      <main className="simari-main">
        {currentPage === 'pengaturan' && <PengaturanAkses onLogout={logout} />}

        {currentPage !== 'pengaturan' && (
          <div className="simari-topbar">
            <div className="topbar-title">
              {currentPage === 'dashboard' && 'Dashboard'}
              {currentPage === 'faskes-nasional' && 'Data Faskes Nasional'}
              {currentPage === 'verifikasi' && 'Antrian Verifikasi'}
              {currentPage === 'validasi' && 'Proses Validasi'}
            </div>
            <div className="topbar-actions">
              <button className="simari-btn simari-btn-ghost">🔔</button>
              <button className="simari-btn simari-btn-ghost">⚙</button>
              {currentPage !== 'verifikasi' && (
                <button
                  className="simari-btn simari-btn-primary"
                  onClick={() => setCurrentPage('verifikasi')}
                >
                  Verifikasi ({pendingVerification})
                </button>
              )}
            </div>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Selamat datang, {user?.name?.split(' ')[0]} 👋</h1>
              <p>Monitoring kematangan RME faskes di {region?.name}</p>
            </div>

            {/* Metrics */}
            <div className="grid-4 mb-20">
              <div className="metric-card">
                <div className="metric-label">Total Faskes</div>
                <div className="metric-value">{regionalHospitals.length}</div>
                <div className="metric-change text-muted">Di wilayah {region?.name}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Rata-rata Stage</div>
                <div className="metric-value">{avgStage}</div>
                <div className="metric-change text-muted">EMRAM regional</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Perlu Verifikasi</div>
                <div className="metric-value">{pendingVerification}</div>
                <div className="metric-change text-muted">Assessment menunggu</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Sudah Diverifikasi</div>
                <div className="metric-value">{verified}</div>
                <div className="metric-change text-muted">Sudah diteruskan</div>
              </div>
            </div>

            {/* Stage distribution chart + antrian */}
            <div className="grid-2 mb-20">
              <div className="simari-card">
                <div className="card-title">Distribusi Stage EMRAM — {region?.name}</div>
                <div style={{ marginTop: '16px', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stageChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid key="dist-grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis key="dist-xaxis" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} />
                      <YAxis key="dist-yaxis" tick={{ fontSize: 11, fill: 'var(--text3)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <ReTooltip
                        key="dist-tooltip"
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)' }}
                        formatter={(val: number) => [`${val} faskes`, 'Jumlah']}
                      />
                      <Bar key="dist-bar" dataKey="count" radius={[4, 4, 0, 0]}>
                        {stageChartData.map((entry, i) => (
                          <Cell key={`dist-cell-${i}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="simari-card">
                <div className="card-title">Antrian Verifikasi</div>
                {pendingVerification === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: '13px' }}>
                    Tidak ada assessment yang perlu diverifikasi saat ini.
                  </div>
                ) : (
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {regionalAssessments
                      .filter(a => a.status === 'submitted' || a.status === 'under_review')
                      .map(assessment => (
                        <div key={assessment.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{assessment.hospitalName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: 2 }}>
                              Score: {assessment.totalScore}% · {assessment.submittedAt ? new Date(assessment.submittedAt).toLocaleDateString('id-ID') : '—'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={`stage-badge ${getStageClass(assessment.targetStage)}`}>
                              Stage {assessment.targetStage}
                            </span>
                            <button className="simari-btn simari-btn-outline" style={{ padding: '3px 10px', fontSize: '11px' }}>
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* DIY Province Map */}
            <div className="simari-card mb-20">
              <div className="card-title" style={{ marginBottom: '16px' }}>
                Peta Faskes — {region?.name ?? provinsiFilter}
              </div>
              <PetaProvinsi faskes={regionalFaskes} provinsiLabel={region?.name} />
            </div>

            {/* Analisis Kematangan */}
            <AnalisisKematangan
              faskes={regionalFaskes}
              judul={`Analisis Kematangan RME — ${region?.name ?? 'Regional'}`}
              subtitle={`Tingkat kematangan RME faskes di wilayah ${region?.name ?? 'regional'} berdasarkan HIMSS EMRAM`}
              embedded
            />
          </div>
        )}

        {currentPage === 'faskes-nasional' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Data Faskes Nasional</h1>
              <p>Direktori lengkap fasilitas kesehatan di seluruh Indonesia</p>
            </div>

            {/* Filter bar */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
              <input
                placeholder="Cari nama / kabupaten…"
                value={fnSearch}
                onChange={e => setFnSearch(e.target.value)}
                style={{ ...inputStyle, minWidth: '200px' }}
              />
              <select value={fnProvinsi} onChange={e => { setFnProvinsi(e.target.value); setFnKabupaten(''); }} style={inputStyle}>
                <option value="">Semua Provinsi</option>
                {provinsiList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={fnKabupaten} onChange={e => setFnKabupaten(e.target.value)} style={inputStyle}>
                <option value="">Semua Kab/Kota</option>
                {kabupatenList.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <select value={fnStage ?? ''} onChange={e => setFnStage(e.target.value === '' ? null : Number(e.target.value))} style={inputStyle}>
                <option value="">Semua Stage</option>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>Stage {s}</option>)}
              </select>
              <select value={fnStatus} onChange={e => setFnStatus(e.target.value)} style={inputStyle}>
                <option value="">Semua Status</option>
                {['Tervalidasi', 'Dalam Review', 'Draft', 'Belum'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: 'auto' }}>
                {filteredNasional.length} dari {allFaskes.length} faskes
              </span>
            </div>

            <div className="simari-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
                <table className="simari-table">
                  <thead>
                    <tr>
                      <th>Nama Faskes</th>
                      <th>Jenis / Kelas</th>
                      <th>Provinsi</th>
                      <th>Kabupaten</th>
                      <th>Stage EMRAM</th>
                      <th>Tempat Tidur</th>
                      <th>Status</th>
                      <th>Tgl Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNasional.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                          Tidak ada data yang sesuai filter
                        </td>
                      </tr>
                    )}
                    {filteredNasional.map(f => (
                      <tr key={f.id}>
                        <td style={{ fontWeight: 500, fontSize: '13px' }}>{f.nama}</td>
                        <td>
                          <span style={{ fontSize: '12px' }}>{f.jenis}</span>
                          {f.kelas !== '-' && (
                            <span style={{ marginLeft: 4, fontSize: '10px', background: 'var(--surface2)', padding: '1px 5px', borderRadius: 4, color: 'var(--text3)' }}>
                              Kelas {f.kelas}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px' }}>{f.provinsi}</td>
                        <td style={{ fontSize: '12px' }}>{f.kabupaten}</td>
                        <td>
                          <span className={`stage-badge ${getStageClass(f.stageEMRAM)}`}>
                            Stage {f.stageEMRAM}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text3)' }}>{f.tempatTidur} TT</td>
                        <td>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: statusColor[f.statusAssessment] ?? 'var(--text)' }}>
                            {f.statusAssessment}
                          </span>
                        </td>
                        <td style={{ fontSize: '11px', color: 'var(--text3)' }}>
                          {f.tanggalAssessment
                            ? new Date(f.tanggalAssessment).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'verifikasi' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Antrian Verifikasi</h1>
              <p>Review dan verifikasi assessment dari faskes di wilayah Anda</p>
            </div>
            <div className="simari-card">
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>◐</div>
                <h2 className="serif" style={{ fontSize: '20px', marginBottom: '8px' }}>
                  Proses Verifikasi
                </h2>
                <p className="text-muted">
                  Review assessment dan teruskan ke Kemenkes untuk validasi final
                </p>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'validasi' && (
          <div className="page-content">
            <div className="page-header">
              <h1>Proses Validasi</h1>
              <p>Assessment yang sedang dalam proses validasi Kemenkes</p>
            </div>
            <div className="simari-card">
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
                Belum ada assessment yang diteruskan ke Kemenkes.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
