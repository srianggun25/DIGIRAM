import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAssessments } from '../contexts/AssessmentContext';
import type { Assessment } from '../types';

const categoryNames: Record<string, string> = {
  cat1: 'Ancillary Clinical Systems',
  cat2: 'Clinical Documentation',
  cat3: 'Order Entry & CPOE',
  cat4: 'Data Analytics & Reporting',
  cat5: 'Interoperability & HIE',
};

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  draft:            { label: 'Draft',           cls: 'status-draft',  dot: '#9C978E' },
  submitted:        { label: 'Menunggu Review', cls: 'status-review', dot: '#D97706' },
  under_review:     { label: 'Dalam Review',    cls: 'status-review', dot: '#D97706' },
  reviewed:         { label: 'Direview',        cls: 'status-review', dot: '#D97706' },
  under_validation: { label: 'Validasi Kemenkes', cls: 'status-review', dot: '#5B3F8C' },
  validated:        { label: 'Tervalidasi',     cls: 'status-done',   dot: '#0E6640' },
};

function fmt(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? 'var(--accent)' : score >= 65 ? 'var(--warn)' : 'var(--danger)';
  return (
    <span style={{ fontSize: '13px', fontWeight: 700, color }}>
      {score > 0 ? `${score}%` : '—'}
    </span>
  );
}

function TimelineStep({
  label, date, done, last,
}: { label: string; date?: string; done: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
          background: done ? 'var(--accent)' : 'var(--surface2)',
          border: `2px solid ${done ? 'var(--accent)' : 'var(--border2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '10px', fontWeight: 700,
        }}>
          {done ? '✓' : ''}
        </div>
        {!last && <div style={{ width: '2px', flex: 1, background: done ? 'var(--accent-light)' : 'var(--border)', marginTop: '3px', minHeight: '20px' }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: done ? 'var(--text)' : 'var(--text3)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{done ? fmt(date) : 'Belum'}</div>
      </div>
    </div>
  );
}

function AssessmentDetail({ a }: { a: Assessment }) {
  const sc = statusConfig[a.status] ?? statusConfig.draft;
  const categories = Object.entries(a.categoryScores || {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>ID Assessment</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{a.id}</div>
          </div>
          <span className={`status-badge ${sc.cls}`}>{sc.label}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Stage Saat Ini', value: <span className={`stage-badge stage-s${a.currentStage}`}>Stage {a.currentStage}</span> },
            { label: 'Target Stage', value: <span className={`stage-badge stage-s${a.targetStage}`}>Stage {a.targetStage}</span> },
            { label: 'Skor Keseluruhan', value: <ScoreBadge score={a.totalScore} /> },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '4px' }}>{label}</div>
              {value}
            </div>
          ))}
        </div>
      </div>

      {/* Score per domain */}
      {categories.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
            Skor per Kategori
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map(([catId, score]) => {
              const pct = score as number;
              const color = pct >= 85 ? 'var(--accent)' : pct >= 65 ? 'var(--warn)' : 'var(--danger)';
              return (
                <div key={catId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{categoryNames[catId] || catId}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
          Alur Status
        </div>
        <div style={{ padding: '16px 20px' }}>
          <TimelineStep label="Dibuat" date={a.createdAt} done={true} />
          <TimelineStep label="Disubmit ke Dinkes" date={a.submittedAt} done={!!a.submittedAt} />
          <TimelineStep label="Direview Dinkes" date={a.reviewedAt} done={!!a.reviewedAt} />
          <TimelineStep label="Validasi Kemenkes" date={a.validatedAt} done={!!a.validatedAt} last />
        </div>
      </div>

      {/* Catatan */}
      {(a.hospitalNotes || a.reviewerComments || a.ministryComments) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
            Catatan & Komentar
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {a.hospitalNotes && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Catatan Faskes</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', background: 'var(--surface2)', borderRadius: '8px', padding: '10px 12px', lineHeight: 1.6 }}>
                  {a.hospitalNotes}
                </div>
              </div>
            )}
            {a.reviewerComments && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Komentar Reviewer Dinkes</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', background: 'var(--warn-light)', border: '1px solid #f5d48a', borderRadius: '8px', padding: '10px 12px', lineHeight: 1.6 }}>
                  {a.reviewerComments}
                </div>
              </div>
            )}
            {a.ministryComments && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Keputusan Kemenkes</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', background: 'var(--accent-light)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '10px 12px', lineHeight: 1.6 }}>
                  {a.ministryComments}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA for draft */}
      {a.status === 'draft' && (
        <div style={{ background: 'var(--accent)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>Assessment ini masih Draft</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>Lanjutkan pengisian instrumen EMRAM</div>
          </div>
          <button style={{ padding: '8px 18px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.5)', background: 'transparent', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Lanjutkan →
          </button>
        </div>
      )}
    </div>
  );
}

interface RiwayatAssessmentProps {
  hospitalId: string;
}

export function RiwayatAssessment({ hospitalId }: RiwayatAssessmentProps) {
  const { getAssessmentsByHospital } = useAssessments();
  const assessments = getAssessmentsByHospital(hospitalId);
  const [selectedId, setSelectedId] = useState<string | null>(assessments[0]?.id ?? null);

  const selected = assessments.find(a => a.id === selectedId);

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
          Riwayat Assessment
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
          Seluruh rekam audit EMRAM — klik baris untuk melihat detail lengkap
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>▣</div>
          <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Belum ada assessment. Mulai audit baru untuk memulai.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* LEFT: assessment list */}
          <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
              {assessments.length} Assessment
            </div>
            {assessments.map((a) => {
              const sc = statusConfig[a.status] ?? statusConfig.draft;
              const isSelected = a.id === selectedId;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--accent)' : 'var(--text)' }}>{a.id}</span>
                    <span className={`status-badge ${sc.cls}`} style={{ fontSize: '10px' }}>{sc.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className={`stage-badge stage-s${a.targetStage}`} style={{ fontSize: '10px' }}>Target Stage {a.targetStage}</span>
                    {a.totalScore > 0 && (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: a.totalScore >= 85 ? 'var(--accent)' : a.totalScore >= 65 ? 'var(--warn)' : 'var(--danger)' }}>
                        {a.totalScore}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                    {fmt(a.createdAt)}
                    {a.validatedAt && <span style={{ color: 'var(--accent)', marginLeft: '6px' }}>· Divalidasi {fmt(a.validatedAt)}</span>}
                  </div>
                  {/* mini progress bar */}
                  {a.totalScore > 0 && (
                    <div className="progress-wrap" style={{ marginTop: '8px' }}>
                      <div className="progress-fill" style={{
                        width: `${a.totalScore}%`,
                        background: a.totalScore >= 85 ? 'var(--accent)' : a.totalScore >= 65 ? 'var(--warn)' : 'var(--danger)',
                      }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT: detail panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {selected ? (
              <AssessmentDetail a={selected} />
            ) : (
              <div className="simari-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
                Pilih assessment di kiri untuk melihat detail
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
