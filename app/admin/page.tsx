'use client';

import { useState, useEffect, useCallback } from 'react';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  startTime: string;
  endTime: string;
  status: string;
  service: Service;
}

interface DashboardData {
  stats: {
    todayBookingsCount: number;
    todayRevenue: number;
    newClientsToday: number;
    cancelledToday: number;
    totalBookings: number;
  };
  todayBookings: Booking[];
  upcomingBookings: Booking[];
}

const BUSINESS_SLUG = 'demo-barbershop';

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#6366f1',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
};

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifyLoading, setNotifyLoading] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<{ link: string; name: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/dashboard?businessSlug=${BUSINESS_SLUG}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const updateStatus = async (bookingId: string, status: string) => {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(`Cita marcada como ${statusLabel[status]}`);
      fetchData();
    } else {
      showToast('Error al actualizar el estado', 'error');
    }
  };

  const sendNotification = async (bookingId: string, type: string, clientName: string) => {
    setNotifyLoading(bookingId + type);
    try {
      const res = await fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, type }),
      });
      const data = await res.json();
      if (data.waLink) {
        setWaLink({ link: data.waLink, name: clientName });
      } else {
        showToast('Notificación enviada automáticamente ✓');
      }
    } catch {
      showToast('Error al enviar notificación', 'error');
    } finally {
      setNotifyLoading(null);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const timeUntil = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff < 0) return 'Pasada';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `En ${hours}h ${mins}m`;
    return `En ${mins} min`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid var(--surface-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Cargando dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="animate-fade-in">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1000,
          padding: '14px 20px', borderRadius: '10px', fontWeight: '500',
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: toast.type === 'success' ? '#4ade80' : '#f87171',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* WhatsApp Modal */}
      {waLink && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }} onClick={() => setWaLink(null)}>
          <div className="glass-panel" style={{ padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Enviar por WhatsApp</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
              Haz clic para abrir WhatsApp y enviar la notificación a <strong>{waLink.name}</strong>
            </p>
            <a href={waLink.link} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '14px', borderRadius: '10px', background: '#25D366', color: 'white', fontWeight: '700', textDecoration: 'none', fontSize: '16px', marginBottom: '12px', boxShadow: '0 4px 20px rgba(37,211,102,0.4)' }}>
              📲 Abrir WhatsApp
            </a>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setWaLink(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>Dashboard General</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="btn-secondary" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={fetchData}>
          🔄 Actualizar
        </button>
      </header>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Citas Hoy', value: stats?.todayBookingsCount ?? 0, icon: '📅', color: '#6366f1' },
          { label: 'Ingresos Hoy', value: `$${stats?.todayRevenue?.toFixed(2) ?? '0.00'}`, icon: '💰', color: '#22c55e' },
          { label: 'Clientes Nuevos', value: stats?.newClientsToday ?? 0, icon: '👥', color: '#f59e0b' },
          { label: 'Cancelaciones', value: stats?.cancelledToday ?? 0, icon: '❌', color: '#ef4444' },
          { label: 'Total Citas', value: stats?.totalBookings ?? 0, icon: '📊', color: '#ec4899' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>{stat.icon}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </section>

      {/* Upcoming Bookings */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Próximas Citas</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {data?.upcomingBookings?.length ?? 0} pendientes
          </span>
        </div>

        {!data?.upcomingBookings?.length ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <p>No hay citas próximas. ¡Todo al día!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.upcomingBookings.map((booking) => (
              <div key={booking.id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center',
                background: 'rgba(0,0,0,0.2)', padding: '16px 20px', borderRadius: '10px',
                border: '1px solid var(--surface-border)', transition: 'var(--transition)',
              }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: 0 }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', background: `${statusColors[booking.status]}20`,
                    border: `2px solid ${statusColors[booking.status]}`, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px',
                  }}>
                    {booking.status === 'CONFIRMED' ? '✓' : booking.status === 'COMPLETED' ? '★' : '◷'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '2px' }}>{booking.clientName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>{booking.service.name} · ${booking.service.price}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', background: `${statusColors[booking.status]}20`, color: statusColors[booking.status] }}>
                        {statusLabel[booking.status]}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right', marginRight: '8px' }}>
                    <div style={{ fontWeight: '700', fontSize: '18px' }}>{formatTime(booking.startTime)}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{timeUntil(booking.startTime)}</div>
                  </div>

                  {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                    <>
                      {booking.status === 'PENDING' && (
                        <button className="btn-secondary" style={{ padding: '7px 12px', fontSize: '13px' }}
                          onClick={() => updateStatus(booking.id, 'CONFIRMED')}>
                          Confirmar
                        </button>
                      )}
                      <button className="btn-primary" style={{ padding: '7px 12px', fontSize: '13px' }}
                        onClick={() => updateStatus(booking.id, 'COMPLETED')}>
                        Completar
                      </button>
                      <button className="btn-secondary" style={{ padding: '7px 12px', fontSize: '13px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                        onClick={() => updateStatus(booking.id, 'CANCELLED')}>
                        Cancelar
                      </button>
                    </>
                  )}

                  <button
                    style={{
                      padding: '7px 12px', fontSize: '13px', borderRadius: '8px', border: 'none',
                      background: notifyLoading === booking.id + 'confirmation' ? 'rgba(37,211,102,0.5)' : '#25D366',
                      color: 'white', cursor: 'pointer', fontWeight: '600', transition: 'var(--transition)',
                      boxShadow: '0 2px 10px rgba(37,211,102,0.3)',
                    }}
                    onClick={() => sendNotification(booking.id, 'confirmation', booking.clientName)}
                    disabled={notifyLoading === booking.id + 'confirmation'}
                    title="Enviar confirmación por WhatsApp"
                  >
                    {notifyLoading === booking.id + 'confirmation' ? '...' : '💬 WA'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
