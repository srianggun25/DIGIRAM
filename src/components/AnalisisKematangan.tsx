import { useState, useMemo, Fragment } from 'react';
import type { FaskesRME } from '../data/visualisasiData';
import { STAGE_COLORS } from '../data/visualisasiData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  'Tervalidasi':  { label: 'Tervalidasi',  cls: 'status-done'   },
  'Dalam Review': { label: 'Dalam Review', cls: 'status-review'  },
  'Draft':        { label: 'Draft',        cls: 'status-draft'   },
  'Belum':        { label: 'Belum',        cls: 'status-draft'   },
};

const STAGE_DESC: Record<number, string> = {
  0: 'Pra-Implementasi',
  1: 'Ancillary Systems',
  2: 'CDR & Interoperabilitas',
  3: 'Dokumentasi & e-Prescribing',
  4: 'CPOE & CDS',
  5: 'Dokumentasi Dokter',
  6: 'Closed-Loop Admin',
  7: 'Paperless & HIE',
};

interface AnalisisKematanganProps {
  faskes: FaskesRME[];
  judul?: string;
  subtitle?: string;
  embedded?: boolean;
}

export function AnalisisKematangan({
  faskes,
  judul = 'Analisis Kematangan RME',
  subtitle = 'Ringkasan tingkat kematangan RME berdasarkan HIMSS EMRAM',
  embedded = false,
}: AnalisisKematanganProps) {
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'stage' | 'nama' | 'status'>('stage');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Stage distribution for chart
  const stageDistData = useMemo(() =>
    [0, 1, 2, 3, 4, 5, 6, 7].map(s => ({
      name: `S${s}`,
      label: STAGE_DESC[s],
      count: faskes.filter(f => f.stageEMRAM === s).length,
      fill: STAGE_COLORS[s],
    })),
    [faskes]
  );

  // Radar data: avg stage per jenis RS
  const radarData = useMemo(() => {
    const jenis = [...new Set(faskes.map(f => f.jenis))];
    return jenis.map(j => {
      const subset = faskes.filter(f => f.jenis === j);
      const avg = subset.reduce((s, f) => s + f.stageEMRAM, 0) / (subset.length || 1);
      return { jenis: j.replace('RS ', '').replace('RSUD', 'RSUD'), avg: parseFloat(avg.toFixed(1)), jumlah: subset.length };
    });
  }, [faskes]);

  // Summary stats
  const totalRS = faskes.length;
  const avgStage = totalRS > 0
    ? (faskes.reduce((s, f) => s + f.stageEMRAM, 0) / totalRS).toFixed(1)
    : '0';
  const maxStageRS = faskes.reduce((best, f) => f.stageEMRAM > (best?.stageEMRAM ?? -1) ? f : best, faskes[0]);
  const belumAssessment = faskes.filter(f => f.statusAssessment === 'Belum').length;

  // Stage progression: count by stage
  const stageGroups = useMemo(() => {
    const groups: Record<number, FaskesRME[]> = {};
    for (let i = 0; i <= 7; i++) groups[i] = faskes.filter(f => f.stageEMRAM === i);
    return groups;
  }, [faskes]);

  // Filtered & sorted table
  const filteredFaskes = useMemo(() => {
    let data = faskes;
    if (search) data = data.filter(f => f.nama.toLowerCase().includes(search.toLowerCase()) || f.kabupaten.toLowerCase().includes(search.toLowerCase()));
    if (filterStage !== null) data = data.filter(f => f.stageEMRAM === filterStage);
    if (filterStatus) data = data.filter(f => f.statusAssessment === filterStatus);
    return [...data].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'stage') cmp = a.stageEMRAM - b.stageEMRAM;
      else if (sortBy === 'nama') cmp = a.nama.localeCompare(b.nama);
      else cmp = a.statusAssessment.localeCompare(b.statusAssessment);
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [faskes, search, filterStage, filterStatus, sortBy, sortDir]);

  const handleSort = (col: 'stage' | 'nama' | 'status') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };
  const sortIcon = (col: string) => sortBy === col ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';

  const inputStyle: React.CSSProperties = {
    fontSize: '12px', padding: '6px 10px', borderRadius: '6px',
    border: '1px solid var(--border2)', background: 'var(--surface2)',
    color: 'var(--text)', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const inner = (
    <>
      {!embedded && (
        <div className="page-header">
          <h1 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            {judul}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>{subtitle}</p>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid-4 mb-20">
        <div className="metric-card">
          <div className="metric-label">Total Faskes</div>
          <div className="metric-value">{totalRS}</div>
          <div className="metric-change text-muted">Dalam dataset</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Rata-rata Stage</div>
          <div className="metric-value">{avgStage}</div>
          <div className="metric-change">
            <span className={`stage-badge stage-s${Math.round(parseFloat(avgStage))}`}>
              Stage {Math.round(parseFloat(avgStage))}
            </span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Stage Tertinggi</div>
          <div className="metric-value">{maxStageRS?.stageEMRAM ?? '—'}</div>
          <div className="metric-change text-muted" style={{ fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {maxStageRS?.nama}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Belum Assessment</div>
          <div className="metric-value">{belumAssessment}</div>
          <div className="metric-change text-muted">Perlu didorong</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Stage Distribution Bar */}
        <div className="simari-card">
          <div className="card-title">Distribusi Stage EMRAM</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stageDistData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid key="ak-bar-grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis key="ak-bar-xaxis" dataKey="name" tick={{ fontSize: 11, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
              <YAxis key="ak-bar-yaxis" tick={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
              <ReTooltip key="ak-bar-tooltip"
                formatter={(val, _, props) => [`${val} faskes`, props.payload?.label]}
                contentStyle={{ fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", border: '1px solid var(--border)', borderRadius: '6px' }}
              />
              <Bar key="ak-bar-count" dataKey="count" radius={[4, 4, 0, 0]}
                onClick={(_data, index) => setFilterStage(filterStage === index ? null : index)}
              >
                {stageDistData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.fill} stroke={filterStage === i ? '#333' : 'transparent'} strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px', textAlign: 'center' }}>
            Klik batang untuk filter tabel
          </p>
        </div>

        {/* Avg stage by jenis RS */}
        <div className="simari-card">
          <div className="card-title">Rata-rata Stage per Jenis RS</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
              <PolarGrid key="ak-radar-grid" stroke="var(--border)" />
              <PolarAngleAxis key="ak-radar-axis" dataKey="jenis" tick={{ fontSize: 9, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
              <Radar key="ak-radar-avg" name="Avg Stage" dataKey="avg" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} />
              <ReTooltip key="ak-radar-tooltip" formatter={(val) => [`Stage ${val}`, 'Rata-rata']} contentStyle={{ fontSize: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stage Progression Heatmap */}
      <div className="simari-card" style={{ marginBottom: '20px' }}>
        <div className="card-title" style={{ marginBottom: '12px' }}>Sebaran Faskes per Stage</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(stage => {
            const count = stageGroups[stage].length;
            const pct = totalRS > 0 ? Math.round((count / totalRS) * 100) : 0;
            const isActive = filterStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setFilterStage(isActive ? null : stage)}
                style={{
                  flex: 1, minWidth: '80px', padding: '10px 8px', borderRadius: '8px',
                  border: `2px solid ${isActive ? '#333' : 'transparent'}`,
                  background: STAGE_COLORS[stage],
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: isActive ? '0 0 0 2px var(--accent)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 700, color: stage >= 5 ? 'white' : '#1A1A1A' }}>
                  {count}
                </div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: stage >= 5 ? 'rgba(255,255,255,0.9)' : '#555', marginBottom: '2px' }}>
                  STAGE {stage}
                </div>
                <div style={{ fontSize: '9px', color: stage >= 5 ? 'rgba(255,255,255,0.75)' : '#888' }}>
                  {pct}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Table */}
      <div className="simari-card">
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama faskes atau kabupaten..."
            style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="">Semua Status</option>
            <option value="Tervalidasi">Tervalidasi</option>
            <option value="Dalam Review">Dalam Review</option>
            <option value="Draft">Draft</option>
            <option value="Belum">Belum</option>
          </select>
          {(filterStage !== null || filterStatus || search) && (
            <button
              onClick={() => { setFilterStage(null); setFilterStatus(''); setSearch(''); }}
              style={{
                padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                border: '1px solid var(--danger)', background: 'var(--danger-light)',
                color: 'var(--danger)', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              × Reset Filter
            </button>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text3)', marginLeft: 'auto' }}>
            {filteredFaskes.length} faskes ditampilkan
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="simari-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('nama')}>
                  Nama Faskes{sortIcon('nama')}
                </th>
                <th>Jenis / Kelas</th>
                <th>Kabupaten / Provinsi</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('stage')}>
                  Stage EMRAM{sortIcon('stage')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                  Status{sortIcon('status')}
                </th>
                <th>Assessment Terakhir</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaskes.map(f => {
                const isExpanded = expanded === f.id;
                const sc = STATUS_CONFIG[f.statusAssessment] ?? STATUS_CONFIG['Belum'];
                return (
                  <Fragment key={f.id}>
                    <tr
                      style={{ cursor: 'pointer', background: isExpanded ? 'var(--accent-light)' : undefined }}
                      onClick={() => setExpanded(isExpanded ? null : f.id)}
                    >
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{f.nama}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{f.jenis}</span>
                        {f.kelas !== '-' && (
                          <span style={{ marginLeft: '4px', fontSize: '10px', background: 'var(--surface2)', padding: '1px 5px', borderRadius: '4px', color: 'var(--text3)' }}>
                            Kelas {f.kelas}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: '12px' }}>{f.kabupaten}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{f.provinsi}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`stage-badge stage-s${f.stageEMRAM}`}>Stage {f.stageEMRAM}</span>
                        </div>
                        {/* Stage mini bar */}
                        <div style={{ marginTop: '5px', display: 'flex', gap: '2px' }}>
                          {[0,1,2,3,4,5,6,7].map(s => (
                            <div key={s} style={{
                              width: '12px', height: '4px', borderRadius: '2px',
                              background: s <= f.stageEMRAM ? STAGE_COLORS[f.stageEMRAM] : 'var(--surface2)',
                            }} />
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${sc.cls}`} style={{ fontSize: '10px' }}>{sc.label}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text3)' }}>
                        {f.tanggalAssessment
                          ? new Date(f.tanggalAssessment).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${f.id}-detail`}>
                        <td colSpan={6} style={{ padding: '0', background: 'var(--accent-light)', borderTop: 'none' }}>
                          <div style={{ padding: '14px 20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Detail Faskes</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '4px', fontSize: '12px' }}>
                                <span style={{ color: 'var(--text3)' }}>Kecamatan:</span><span>{f.kecamatan}</span>
                                <span style={{ color: 'var(--text3)' }}>Tempat Tidur:</span><span>{f.tempatTidur} TT</span>
                                <span style={{ color: 'var(--text3)' }}>Stage Saat Ini:</span>
                                <span><span className={`stage-badge stage-s${f.stageEMRAM}`}>{STAGE_DESC[f.stageEMRAM]}</span></span>
                              </div>
                            </div>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Target Berikutnya</div>
                              {f.stageEMRAM < 7 ? (
                                <div style={{ fontSize: '12px', color: 'var(--text2)', background: 'var(--surface)', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.7 }}>
                                  <span className={`stage-badge stage-s${f.stageEMRAM + 1}`} style={{ marginBottom: '6px', display: 'inline-block' }}>
                                    Stage {f.stageEMRAM + 1} — {STAGE_DESC[f.stageEMRAM + 1]}
                                  </span>
                                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                                    Penuhi indikator Stage {f.stageEMRAM + 1} untuk meningkatkan level kematangan RME.
                                  </div>
                                </div>
                              ) : (
                                <span className="status-badge status-done" style={{ fontSize: '11px' }}>Stage Maksimum Tercapai</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filteredFaskes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
                    Tidak ada faskes yang sesuai filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  if (embedded) return <div>{inner}</div>;
  return <div className="page-content">{inner}</div>;
}
