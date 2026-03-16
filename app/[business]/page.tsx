'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

interface BookingResponse {
  id: string;
  clientName: string;
  clientPhone: string;
  startTime: string;
  service: Service;
}

export default function BusinessBookingPage({ params }: { params: Promise<{ business: string }> }) {
  const [businessSlug, setBusinessSlug] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<BookingResponse | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    serviceId: '',
    startTime: '',
    clientName: '',
    clientPhone: '',
  });

  useEffect(() => {
    params.then(({ business }) => {
      setBusinessSlug(business);
      fetch(`/api/services?businessSlug=${business}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setServices(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const businessName =
    businessSlug === 'demo-barbershop'
      ? 'Cortes Club'
      : businessSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessSlug,
          ...formData,
          clientPhone: `+57${formData.clientPhone.replace(/\s/g, '')}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al agendar la cita');
      } else {
        setSuccess(data);
        // Auto-send WhatsApp confirmation
        await fetch('/api/whatsapp/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: data.id, type: 'confirmation' }),
        });
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === formData.serviceId);

  if (success) {
    const date = new Date(success.startTime);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} className="animate-fade-in">
        <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '48px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 0 30px rgba(34,197,94,0.4)' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>¡Cita Confirmada!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Recibirás un mensaje de WhatsApp con los detalles.</p>

          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '24px', textAlign: 'left', marginBottom: '32px' }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Servicio</span>
                <span style={{ fontWeight: '600' }}>{success.service.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fecha</span>
                <span style={{ fontWeight: '600' }}>{date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hora</span>
                <span style={{ fontWeight: '600' }}>{date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cliente</span>
                <span style={{ fontWeight: '600' }}>{success.clientName}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--surface-border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Total</span>
                <span style={{ fontWeight: '700', fontSize: '20px' }} className="gradient-text">${success.service.price}</span>
              </div>
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => { setSuccess(null); setFormData({ serviceId: '', startTime: '', clientName: '', clientPhone: '' }); }}>
            Agendar Otra Cita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }} className="animate-fade-in">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--primary-glow)', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', border: '1px solid rgba(99,102,241,0.3)' }}>
            ✂️
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{businessName}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Agenda tu cita fácilmente</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            Cargando servicios...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Service Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Selecciona el Servicio
              </label>
              {services.length === 0 ? (
                <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '14px' }}>
                  No hay servicios disponibles. Contacta al negocio.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setFormData({ ...formData, serviceId: service.id })}
                      style={{
                        padding: '16px', borderRadius: '10px', cursor: 'pointer',
                        border: formData.serviceId === service.id ? '2px solid var(--primary)' : '1px solid var(--surface-border)',
                        background: formData.serviceId === service.id ? 'rgba(99,102,241,0.1)' : 'rgba(0,0,0,0.2)',
                        transition: 'var(--transition)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{service.name}</div>
                        {service.description && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{service.description}</div>}
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>⏱ {service.duration} min</div>
                      </div>
                      <div style={{ fontWeight: '700', fontSize: '20px' }} className="gradient-text">${service.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={formData.startTime}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            {/* Client Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tu Nombre
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej. Juan Pérez"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                required
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                WhatsApp <span style={{ color: '#25D366' }}>💬</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="input-field" style={{ width: '80px', flexShrink: 0 }} value="+57" readOnly />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="300 000 0000"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  required
                />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Recibirás confirmación y recordatorios por WhatsApp</p>
            </div>

            {/* Summary */}
            {selectedService && formData.startTime && (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>Resumen</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{selectedService.name}</span>
                  <span>${selectedService.price}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {new Date(formData.startTime).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !formData.serviceId || services.length === 0}
              style={{ padding: '16px', fontSize: '16px', width: '100%', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? '⏳ Agendando...' : '✅ Confirmar Cita'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '32px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          Powered by <span className="gradient-text" style={{ fontWeight: 'bold' }}>Bookify</span> SaaS
          {' · '}
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Inicio</Link>
        </div>
      </div>
    </div>
  );
}
