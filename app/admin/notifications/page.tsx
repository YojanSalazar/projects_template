'use client';

import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  type: string;
  channel: string;
  status: string;
  message: string;
  createdAt: string;
  booking: {
    clientName: string;
    clientPhone: string;
    startTime: string;
    service: { name: string };
  };
}

const BUSINESS_SLUG = 'demo-barbershop';

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  CONFIRMATION: { label: 'Confirmación', icon: '✅', color: '#22c55e' },
  REMINDER: { label: 'Recordatorio', icon: '⏰', color: '#f59e0b' },
  CANCELLATION: { label: 'Cancelación', icon: '❌', color: '#ef4444' },
  CUSTOM: { label: 'Personalizado', icon: '💬', color: '#6366f1' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SENT: { label: 'Enviado', color: '#22c55e' },
  PENDING: { label: 'Pendiente', color: '#f59e0b' },
  FAILED: { label: 'Fallido', color: '#ef4444' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?businessSlug=${BUSINESS_SLUG}&limit=50`);
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const sentCount = notifications.filter((n) => n.status === 'SENT').length;
  const pendingCount = notifications.filter((n) => n.status === 'PENDING').length;
  const failedCount = notifications.filter((n) => n.status === 'FAILED').length;

  return (
    <div className="animate-fade-in">
      {/* Message detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelected(null)}>
          <div className="glass-panel" style={{ padding: '40px', maxWidth: '500px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
                {TYPE_CONFIG[selected.type]?.icon} Detalle del Mensaje
              </h3>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ marginBottom: '16px', display: 'grid', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Para</span>
                <span style={{ fontWeight: '600' }}>{selected.booking.clientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Teléfono</span>
                <span>{selected.booking.clientPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tipo</span>
                <span>{TYPE_CONFIG[selected.type]?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estado</span>
                <span style={{ color: STATUS_CONFIG[selected.status]?.color, fontWeight: '600' }}>{STATUS_CONFIG[selected.status]?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Enviado</span>
                <span>{new Date(selected.createdAt).toLocaleString('es-CO')}</span>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '16px', fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-muted)', maxHeight: '300px', overflowY: 'auto' }}>
              {selected.message}
            </div>
          </div>
        </div>
      )}

      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>Notificaciones</h1>
        <p style={{ color: 'var(--text-muted)' }}>Historial de mensajes enviados por WhatsApp</p>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Enviadas', value: sentCount, color: '#22c55e', icon: '✅' },
          { label: 'Pendientes', value: pendingCount, color: '#f59e0b', icon: '⏳' },
          { label: 'Fallidas', value: failedCount, color: '#ef4444', icon: '❌' },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '28px' }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Notifications List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando notificaciones...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <p>No hay notificaciones registradas aún.</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Las notificaciones aparecerán aquí cuando se envíen desde el dashboard.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {notifications.map((notif, i) => {
              const tc = TYPE_CONFIG[notif.type] || { label: notif.type, icon: '💬', color: '#6366f1' };
              const sc = STATUS_CONFIG[notif.status] || { label: notif.status, color: '#94a3b8' };
              return (
                <div
                  key={notif.id}
                  onClick={() => setSelected(notif)}
                  style={{
                    display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: '16px', alignItems: 'center',
                    padding: '16px 20px', cursor: 'pointer', transition: 'var(--transition)',
                    borderBottom: i < notifications.length - 1 ? '1px solid var(--surface-border)' : 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', background: `${tc.color}20`,
                    border: `1px solid ${tc.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>{tc.icon}</div>

                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '3px' }}>
                      {notif.booking.clientName} · <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>{tc.label}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {notif.booking.service.name} · {notif.booking.clientPhone}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: `${sc.color}15`, color: sc.color, display: 'inline-block', marginBottom: '4px' }}>
                      {sc.label}
                    </span>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(notif.createdAt).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
