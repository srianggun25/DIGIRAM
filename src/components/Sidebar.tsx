import { useAuth } from '../contexts/AuthContext';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  const getNavItems = (): { section: string; items: NavItem[] }[] => {
    if (user?.role === 'hospital') {
      return [
        {
          section: 'Utama',
          items: [
            { id: 'dashboard', icon: '◈', label: 'Dashboard' },
            { id: 'profil', icon: '⊞', label: 'Profil Faskes' },
          ],
        },
        {
          section: 'Self Assessment',
          items: [
            { id: 'audit', icon: '✦', label: 'Audit RME Saya' },
            { id: 'riwayat', icon: '▣', label: 'Riwayat Assessment' },
            { id: 'analitik', icon: '◆', label: 'Analisis Kematangan' },
          ],
        },
        {
          section: 'Akun',
          items: [
            { id: 'pengaturan', icon: '⊗', label: 'Pengaturan Akses' },
          ],
        },
      ];
    } else if (user?.role === 'health_office') {
      return [
        {
          section: 'Utama',
          items: [
            { id: 'dashboard', icon: '◈', label: 'Dashboard' },
            { id: 'faskes-nasional', icon: '⊞', label: 'Data Faskes Nasional' },
          ],
        },
        {
          section: 'Verifikasi',
          items: [
            { id: 'verifikasi', icon: '◐', label: 'Antrian Verifikasi', badge: 3 },
            { id: 'validasi', icon: '✦', label: 'Proses Validasi' },
          ],
        },
        {
          section: 'Akun',
          items: [
            { id: 'pengaturan', icon: '⊗', label: 'Pengaturan Akses' },
          ],
        },
      ];
    } else {
      return [
        {
          section: 'Utama',
          items: [
            { id: 'dashboard', icon: '◈', label: 'Dashboard Nasional' },
            { id: 'faskes', icon: '⊞', label: 'Direktori Faskes' },
            { id: 'peta', icon: '◉', label: 'Peta Kesiapan' },
          ],
        },
        {
          section: 'Proses Audit',
          items: [
            { id: 'audit', icon: '✦', label: 'Mulai Audit Baru' },
            { id: 'verifikasi', icon: '◐', label: 'Antrian Verifikasi', badge: 7 },
          ],
        },
        {
          section: 'Laporan',
          items: [
            { id: 'laporan', icon: '▣', label: 'Laporan & Analitik' },
            { id: 'benchmark', icon: '◆', label: 'Benchmark Regional' },
          ],
        },
        {
          section: 'Akun',
          items: [
            { id: 'pengaturan', icon: '⊗', label: 'Pengaturan Akses' },
          ],
        },
      ];
    }
  };

  const getRoleLabel = () => {
    if (user?.role === 'hospital') return 'Staff Rumah Sakit';
    if (user?.role === 'health_office') return 'Admin Dinkes';
    return 'Admin Pusat · Kemenkes';
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) return names[0][0] + names[1][0];
    return names[0][0];
  };

  return (
    <aside className="simari-sidebar scrollbar-thin">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">D</div>
          <div className="logo-text">DIGIRAM</div>
        </div>
        <div className="logo-sub">EMRAM · AUDIT RME NASIONAL</div>
      </div>

      <nav className="sidebar-nav">
        {getNavItems().map((section, idx) => (
          <div key={idx} className="nav-section">
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onPageChange(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* User card — clickable to settings */}
        <button
          onClick={() => onPageChange('pengaturan')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: currentPage === 'pengaturan' ? 'var(--accent-light)' : 'var(--surface2)',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            transition: 'background 0.15s',
          }}
        >
          <div className="user-avatar">{getUserInitials()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ color: currentPage === 'pengaturan' ? 'var(--accent)' : 'var(--text)' }}>
              {user?.name}
            </div>
            <div className="user-role">{getRoleLabel()}</div>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text3)' }}>⚙</span>
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 10px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: 'var(--danger)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            marginTop: '4px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-light)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <span style={{ fontSize: '13px' }}>→</span>
          Keluar dari Sistem
        </button>
      </div>
    </aside>
  );
}
