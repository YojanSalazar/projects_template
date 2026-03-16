import Link from 'next/link';

export default function Home() {
  return (
    <div className="page-container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }} className="animate-fade-in">
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          <span className="gradient-text">Bookify</span> SaaS
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/admin">
            <button className="btn-secondary">Panel Dueño</button>
          </Link>
          <Link href="/demo-barbershop">
            <button className="btn-primary">Ver Demo Cliente</button>
          </Link>
        </div>
      </nav>

      <main style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <h1 style={{ fontSize: '56px', lineHeight: '1.2', marginBottom: '24px', fontWeight: '700' }} className="animate-fade-in delay-1">
          El Sistema de Agendamiento <br />
          <span className="gradient-text">Definitivo para tu Negocio</span>
        </h1>
        
        <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6' }} className="animate-fade-in delay-2">
          Barberías, spas, salones de belleza y más. Gestiona tus citas, notifica a tus clientes por WhatsApp y haz crecer tu negocio con nuestra plataforma multi-tenant.
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '80px' }} className="animate-fade-in delay-3">
          <Link href="/admin">
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '18px' }}>
              Comenzar Gratis
            </button>
          </Link>
          <Link href="/demo-barbershop">
            <button className="btn-secondary" style={{ padding: '16px 32px', fontSize: '18px' }}>
              Explorar Demo
            </button>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', textAlign: 'left' }} className="animate-fade-in delay-3">
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📱</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>Reservas 24/7</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Tus clientes pueden agendar en cualquier momento desde su celular con una interfaz moderna y rápida.</p>
          </div>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>WhatsApp Auto</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Confirmaciones y recordatorios automáticos directamente al WhatsApp de tus clientes. Cero inasistencias.</p>
          </div>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600' }}>Control Total</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Panel de administración intuitivo para gestionar tus horarios, servicios, profesionales y ganancias.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
