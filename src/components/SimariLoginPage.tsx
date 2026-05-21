import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers } from '../data/mockData';

export function SimariLoginPage() {
  const { login } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');

  const handleLogin = () => {
    if (selectedUser) {
      login(selectedUser);
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'hospital') return 'Staff Rumah Sakit';
    if (role === 'health_office') return 'Admin Dinkes';
    return 'Admin Pusat · Kemenkes';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'var(--accent)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '28px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              margin: '0 auto 16px',
            }}
          >
            D
          </div>
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: '4px',
            }}
          >
            DIGIRAM
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text3)', letterSpacing: '0.04em' }}>
            SISTEM AUDIT KEMATANGAN RME NASIONAL
          </p>
        </div>

        {/* Form */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text2)',
              marginBottom: '8px',
            }}
          >
            Pilih Pengguna (Mode Demo)
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border2)',
              background: 'var(--surface)',
              fontSize: '13px',
              color: 'var(--text)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="">-- Pilih pengguna untuk login --</option>
            {mockUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} — {getRoleLabel(user.role)} — {user.organizationName}
              </option>
            ))}
          </select>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!selectedUser}
          style={{
            width: '100%',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: selectedUser ? 'var(--accent)' : 'var(--surface2)',
            color: selectedUser ? 'white' : 'var(--text3)',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: selectedUser ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          Login
        </button>

        {/* User Cards */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {mockUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user.id)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${selectedUser === user.id ? 'var(--accent)' : 'var(--border)'}`,
                background: selectedUser === user.id ? 'var(--accent-light)' : 'var(--surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: selectedUser === user.id ? 'var(--accent)' : 'var(--surface2)',
                    color: selectedUser === user.id ? 'white' : 'var(--text3)',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                    {getRoleLabel(user.role)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
