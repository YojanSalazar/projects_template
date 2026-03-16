'use client';

import { useState } from 'react';

const BUSINESS_SLUG = 'demo-barbershop';

export default function SettingsPage() {
  const [whatsappKey, setWhatsappKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; waLink?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'business' | 'about'>('whatsapp');

  const [businessForm, setBusinessForm] = useState({
    name: 'Cortes Club',
    address: 'Calle 45 # 20-30, Bogotá',
    phone: '+57 300 000 0000',
    email: 'admin@cortesclub.co',
  });

  const handleSaveKey = () => {
    // In a real app, this would save to a secure location / env variable
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestNotification = async () => {
    if (!testPhone) return;
    setTestSending(true);
    setTestResult(null);
    try {
      // Create a mock booking to test
      await fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: 'test', type: 'confirmation' }),
      });
      setTestResult({
        success: true,
        message: 'Enlace generado correctamente. Haz clic para abrirlo en WhatsApp.',
        waLink: `https://wa.me/${testPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('✅ Prueba de Bookify SaaS - ¡Integración de WhatsApp funcionando correctamente!')}`,
      });
    } catch {
      setTestResult({ success: false, message: 'Error al generar el enlace de prueba.' });
    } finally {
      setTestSending(false);
    }
  };

  const tabs = [
    { id: 'whatsapp', label: '💬 WhatsApp', icon: '💬' },
    { id: 'business', label: '🏪 Negocio', icon: '🏪' },
    { id: 'about', label: 'ℹ️ Acerca de', icon: 'ℹ️' },
  ] as const;

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>Configuración</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ajusta las preferencias de tu negocio</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '400',
              background: activeTab === tab.id ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              transition: 'var(--transition)', fontSize: '14px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* WhatsApp Tab */}
      {activeTab === 'whatsapp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
          {/* Integration Status */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Estado de Integración</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              La integración con WhatsApp genera enlaces automáticos o usa la API de CallMeBot para envío automático.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>✅</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>Modo Manual (wa.me links)</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Siempre disponible — abre WhatsApp con el mensaje listo</div>
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontSize: '12px', fontWeight: '600' }}>Activo</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>⚡</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>Modo Automático (CallMeBot)</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Requiere API Key — envía sin intervención manual</div>
                  </div>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>Sin Configurar</span>
              </div>
            </div>
          </div>

          {/* CallMeBot API Key */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>API Key de CallMeBot</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Configura tu API Key para activar el envío automático de mensajes sin abrir WhatsApp manualmente.
            </p>

            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '16px', marginBottom: '20px', fontSize: '13px' }}>
              <strong style={{ display: 'block', marginBottom: '8px' }}>📋 Cómo obtener tu API Key:</strong>
              <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                <li>Agrega el número <strong style={{ color: 'var(--text-main)' }}>+34 644 52 16 28</strong> a tus contactos de WhatsApp</li>
                <li>Envía el mensaje: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>I allow callmebot to send me messages</code></li>
                <li>Recibirás tu API key por WhatsApp en segundos</li>
                <li>Pégala aquí y guarda en tu archivo <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>.env</code></li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                className="input-field"
                type="password"
                placeholder="Tu API Key de CallMeBot..."
                value={whatsappKey}
                onChange={(e) => setWhatsappKey(e.target.value)}
              />
              <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '12px 20px' }} onClick={handleSaveKey} disabled={!whatsappKey}>
                {saved ? '✓ Guardado' : 'Guardar'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Agrega <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '4px' }}>CALLMEBOT_API_KEY=tu_key</code> a tu archivo <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: '4px' }}>.env</code> para persistir la configuración.
            </p>
          </div>

          {/* Test Notification */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Probar Notificación</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Genera un enlace de prueba para verificar la integración con WhatsApp.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                className="input-field"
                type="tel"
                placeholder="Número completo: 573001234567"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
              <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '12px 20px' }} onClick={handleTestNotification} disabled={!testPhone || testSending}>
                {testSending ? '...' : '🧪 Probar'}
              </button>
            </div>

            {testResult && (
              <div style={{
                padding: '14px', borderRadius: '8px', fontSize: '14px',
                background: testResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${testResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: testResult.success ? '#4ade80' : '#f87171',
              }}>
                {testResult.message}
                {testResult.waLink && (
                  <a href={testResult.waLink} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', marginTop: '10px', padding: '10px', background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '6px', textAlign: 'center', fontWeight: '600' }}>
                    📲 Abrir WhatsApp de Prueba
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Business Tab */}
      {activeTab === 'business' && (
        <div style={{ maxWidth: '640px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Información del Negocio</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              onSubmit={(e) => { e.preventDefault(); alert('Guardado (demo)'); }}>
              {[
                { label: 'Nombre del Negocio', key: 'name', placeholder: 'Mi Barbería' },
                { label: 'Dirección', key: 'address', placeholder: 'Calle 45 # 10-20' },
                { label: 'WhatsApp del Negocio', key: 'phone', placeholder: '+57 300 000 0000' },
                { label: 'Email', key: 'email', placeholder: 'admin@negocio.com' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    {field.label}
                  </label>
                  <input
                    className="input-field"
                    placeholder={field.placeholder}
                    value={businessForm[field.key as keyof typeof businessForm]}
                    onChange={(e) => setBusinessForm({ ...businessForm, [field.key]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                  URL de Reservas
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input className="input-field" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/demo-barbershop`} readOnly style={{ opacity: 0.7 }} />
                  <button type="button" className="btn-secondary" style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontSize: '13px' }}
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${BUSINESS_SLUG}`); }}>
                    Copiar
                  </button>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Comparte esta URL con tus clientes para que puedan agendar citas</p>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '14px', marginTop: '8px' }}>Guardar Configuración</button>
            </form>
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div style={{ maxWidth: '640px' }}>
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}><span className="gradient-text">Bookify</span> SaaS</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Sistema de agendamiento multi-tenant</p>

            <div style={{ display: 'grid', gap: '12px', textAlign: 'left', marginBottom: '32px' }}>
              {[
                { label: 'Versión', value: '1.0.0' },
                { label: 'Framework', value: 'Next.js 16.1.6' },
                { label: 'Base de datos', value: 'SQLite + Prisma ORM' },
                { label: 'Negocio activo', value: BUSINESS_SLUG },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontWeight: '600' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', fontSize: '14px', color: '#4ade80' }}>
                ✅ Sistema operativo y listo para recibir citas
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
