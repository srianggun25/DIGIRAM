import { useState } from 'react';

interface AuditBaruEMRAMProps {
  hospitalName?: string;
  hospitalStage?: number;
  onStartAudit?: () => void;
}

const vendorOptions = [
  'Innosoft Fuse',
  'Medicus',
  'SIMRS GOS (Kemenkes)',
  'IHS — BPJS Kesehatan',
  'Digi — Telkom Indonesia',
  'Lainnya / In-house',
];

const periodeOptions = [
  'Q1 2026 (Januari – Maret 2026)',
  'Q4 2025 (Oktober – Desember 2025)',
  'Q3 2025 (Juli – September 2025)',
  'Q2 2025 (April – Juni 2025)',
];

const jenisFaskesOptions = [
  'RS Umum Pusat',
  'RS Umum Daerah',
  'RS Swasta Nirlaba',
  'RS Swasta Komersial',
  'RS Pendidikan',
  'Puskesmas Rawat Inap',
  'Klinik Utama',
];

const kelasRSOptions = ['Tipe A', 'Tipe B', 'Tipe C', 'Tipe D', 'Non-Kelas'];

function InfoBadge({ label, sub }: { label: string; sub: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        background: 'var(--surface2)',
        borderRadius: '8px',
        marginBottom: '6px',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--accent)',
          background: 'var(--accent-light)',
          padding: '2px 8px',
          borderRadius: '20px',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{sub}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border2)',
  background: 'var(--surface)',
  fontSize: '13px',
  color: 'var(--text)',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text2)',
  marginBottom: '6px',
};

export function AuditBaruEMRAM({ hospitalName = 'RSUD Central General', hospitalStage = 4, onStartAudit }: AuditBaruEMRAMProps) {
  const [kodeFaskes, setKodeFaskes] = useState('RS01827');
  const [faskesFound, setFaskesFound] = useState(true);
  const [jenisFaskes, setJenisFaskes] = useState('RS Umum Daerah');
  const [kelasRS, setKelasRS] = useState('Tipe B');
  const [namaPIC, setNamaPIC] = useState('');
  const [emailPIC, setEmailPIC] = useState('');
  const [vendor, setVendor] = useState('');
  const [periode, setPeriode] = useState('Q2 2025 (April – Juni 2025)');
  const [jenisPenilaian, setJenisPenilaian] = useState<'self' | 'terpandu'>('self');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);

  const handleKodeChange = (val: string) => {
    setKodeFaskes(val);
    setFaskesFound(val.length >= 4);
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const canSubmit = kodeFaskes && namaPIC && emailPIC;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionMessage(null);

    try {
      const payload = {
        hospitalId: kodeFaskes,
        hospitalName,
        status: 'draft',
        currentStage: hospitalStage,
        targetStage: Math.min((hospitalStage ?? 0) + 1, 7),
        answers: [],
        totalScore: 0,
        categoryScores: {},
        createdBy: null,
        hospitalNotes: `Audit awal - ${jenisFaskes} / ${kelasRS}`,
        version: 1,
      };

      const response = await fetch(`${API_BASE_URL}/api/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Gagal menyimpan data.' }));
        throw new Error(errorData.message || 'Server error');
      }

      setSubmissionMessage('Data audit berhasil tersimpan di database Laragon.');
      onStartAudit?.();
    } catch (error) {
      setSubmissionMessage(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data.'
      );
      console.error('Audit submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Topbar */}
      <div className="simari-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text2)' }}>Audit Baru</span>
        </div>
        <div className="topbar-actions">
          <button className="simari-btn simari-btn-ghost">🔔</button>
          <button className="simari-btn simari-btn-ghost">⚙</button>
        </div>
      </div>

      <div className="page-content">
        {/* Page header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            Mulai Audit Baru
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
            Daftarkan fasilitas kesehatan dan mulai proses penilaian EMRAM + Satu Sehat
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* LEFT: Form */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '20px' }}>
                Identifikasi Fasilitas
              </div>

              {/* Kode Faskes */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>
                  Kode Faskes SRS / ASPAK <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={kodeFaskes}
                  onChange={(e) => handleKodeChange(e.target.value)}
                  style={inputStyle}
                  placeholder="Contoh: RS01827"
                />
                <p style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  Ketik kode faskes untuk auto-fill data dari ASPAK / SRS Online
                </p>
              </div>

              {/* SRS found banner */}
              {faskesFound && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#F0FBF5',
                    border: '1px solid #9DDBBA',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>✅</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>
                      Data faskes ditemukan di SRS Online
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text2)', margin: 0, paddingLeft: '22px' }}>
                    {hospitalName} · RS Pemerintah Tipe B · Kulon Progo, DIY
                  </p>
                </div>
              )}

              {/* Jenis Faskes + Kelas RS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Jenis Faskes</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={jenisFaskes}
                      onChange={(e) => setJenisFaskes(e.target.value)}
                      style={{ ...inputStyle, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}
                    >
                      {jenisFaskesOptions.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', fontSize: '12px' }}>▾</span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Kelas RS</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={kelasRS}
                      onChange={(e) => setKelasRS(e.target.value)}
                      style={{ ...inputStyle, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}
                    >
                      {kelasRSOptions.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', fontSize: '12px' }}>▾</span>
                  </div>
                </div>
              </div>

              {/* Nama PIC */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>
                  Nama PIC RME / Narahubung <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={namaPIC}
                  onChange={(e) => setNamaPIC(e.target.value)}
                  placeholder="Nama lengkap"
                  style={inputStyle}
                />
              </div>

              {/* Email PIC */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>
                  Email PIC <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="email"
                  value={emailPIC}
                  onChange={(e) => setEmailPIC(e.target.value)}
                  placeholder="email@faskes.go.id"
                  style={inputStyle}
                />
              </div>

              {/* Vendor */}
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Vendor / Sistem RME yang digunakan</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', paddingRight: '32px', cursor: 'pointer', color: vendor ? 'var(--text)' : 'var(--text3)' }}
                  >
                    <option value="">Pilih vendor...</option>
                    {vendorOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', fontSize: '12px' }}>▾</span>
                </div>
              </div>

              {/* Periode Audit */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Periode Audit</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', paddingRight: '32px', cursor: 'pointer' }}
                  >
                    {periodeOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none', fontSize: '12px' }}>▾</span>
                </div>
              </div>

              {/* Jenis Penilaian */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ ...labelStyle, marginBottom: '10px' }}>Jenis Penilaian</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: 'self', label: 'Self-Assessment', desc: 'Faskes mengisi mandiri, diverifikasi Dinkes' },
                    { value: 'terpandu', label: 'Audit Terpandu', desc: 'Auditor Dinkes/Kemenkes memandu pengisian' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: `2px solid ${jenisPenilaian === opt.value ? 'var(--accent)' : 'var(--border2)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '1px',
                          flexShrink: 0,
                          background: jenisPenilaian === opt.value ? 'var(--accent)' : 'transparent',
                          transition: 'all 0.15s',
                        }}
                        onClick={() => setJenisPenilaian(opt.value as 'self' | 'terpandu')}
                      >
                        {jenisPenilaian === opt.value && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />
                        )}
                      </div>
                      <div onClick={() => setJenisPenilaian(opt.value as 'self' | 'terpandu')}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              {submissionMessage && (
                <div
                  style={{
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: submissionMessage.includes('berhasil') ? '#E6F7E9' : '#FFF2F0',
                    border: submissionMessage.includes('berhasil') ? '1px solid #8BD297' : '1px solid #F9C7C2',
                    color: submissionMessage.includes('berhasil') ? '#1F6D2A' : '#9F2B24',
                    fontSize: '13px',
                  }}
                >
                  {submissionMessage}
                </div>
              )}
              <button
                onClick={canSubmit ? handleSubmit : undefined}
                disabled={!canSubmit || isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: canSubmit ? 'var(--accent)' : 'var(--surface2)',
                  color: canSubmit ? 'white' : 'var(--text3)',
                  fontSize: '14px',
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  opacity: isSubmitting ? 0.75 : 1,
                  transition: 'all 0.15s',
                  letterSpacing: '0.01em',
                }}
              >
                {isSubmitting ? 'Menyimpan...' : 'Mulai Audit → Buka Instrumen'}
              </button>
            </div>
          </div>

          {/* RIGHT: Info panels */}
          <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Tentang Instrumen Hybrid */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
                Tentang Instrumen Hybrid
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.65, marginBottom: '14px' }}>
                Sistem ini menggunakan{' '}
                <strong style={{ color: 'var(--accent)' }}>HIMSS EMRAM Stage 0–7</strong>{' '}
                yang dilokalisasi sebagai kerangka kematangan utama, dilengkapi domain tambahan untuk{' '}
                <strong style={{ color: 'var(--accent)' }}>integrasi API Satu Sehat</strong>{' '}
                sesuai KMK No. 1423/2022.
              </p>
              <InfoBadge label="7 Domain EMRAM" sub="Infrastruktur → Paperless" />
              <InfoBadge label="+1 Domain ID" sub="Integrasi Satu Sehat" />
            </div>

            {/* Riwayat Faskes */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '14px' }}>
                Riwayat Faskes Ini
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Audit terakhir', value: 'Q1 2024', isText: true },
                  {
                    label: 'Stage sebelumnya',
                    value: null,
                    badge: { text: `Stage ${hospitalStage - 1 > 0 ? hospitalStage - 1 : 0}`, cls: `stage-badge stage-s${hospitalStage - 1 > 0 ? hospitalStage - 1 : 0}` },
                  },
                  { label: 'Skor sebelumnya', value: '68 / 100', isText: true },
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '10px',
                      borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{row.label}</span>
                    {row.isText ? (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{row.value}</span>
                    ) : (
                      <span className={row.badge?.cls}>{row.badge?.text}</span>
                    )}
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 10px',
                  background: 'var(--accent-light)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                }}
              >
                Target audit ini: Stage {hospitalStage - 1 > 0 ? hospitalStage - 1 : 0} → Stage {hospitalStage}
              </div>
            </div>

            {/* Perkiraan Waktu */}
            <div
              style={{
                background: 'var(--accent)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.04em' }}>
                Perkiraan Waktu
              </div>
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: '8px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                45–90 mnt
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.55 }}>
                Untuk self-assessment lengkap — Bisa disimpan sebagai draf dan dilanjutkan kemudian
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
