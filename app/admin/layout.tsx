import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <aside style={{ width: '250px', borderRight: '1px solid var(--surface-border)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: 'var(--surface-color)' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          <span className="gradient-text">Bookify</span> <span style={{fontSize: '14px', color: 'var(--text-muted)'}}>Admin</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/admin" style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--surface-hover)', textDecoration: 'none', color: 'var(--text-main)' }}>
            📊 Dashboard
          </Link>
          <Link href="/admin/calendar" style={{ padding: '12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-muted)' }}>
            📅 Calendario
          </Link>
          <Link href="/admin/services" style={{ padding: '12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-muted)' }}>
            ✂️ Servicios
          </Link>
          <Link href="/admin/notifications" style={{ padding: '12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-muted)' }}>
            🔔 Notificaciones
          </Link>
          <Link href="/admin/settings" style={{ padding: '12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-muted)' }}>
            ⚙️ Configuración
          </Link>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <Link href="/">
            <button className="btn-secondary" style={{ width: '100%', fontSize: '14px' }}>Cerrar Sesión</button>
          </Link>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
