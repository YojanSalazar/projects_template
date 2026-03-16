'use client';

import { useState, useEffect, useCallback } from 'react';

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
}

const BUSINESS_SLUG = 'demo-barbershop';

const emptyForm = { name: '', description: '', price: '', duration: '' };

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`/api/services?businessSlug=${BUSINESS_SLUG}`);
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      duration: String(service.duration),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingId ? `/api/services/${editingId}` : '/api/services';
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId
        ? { name: form.name, description: form.description, price: form.price, duration: form.duration }
        : { businessSlug: BUSINESS_SLUG, ...form };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showMsg(editingId ? '✅ Servicio actualizado' : '✅ Servicio creado');
        setShowForm(false);
        fetchServices();
      } else {
        const data = await res.json();
        showMsg(`❌ ${data.error}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio? Las citas asociadas quedarán sin servicio.')) return;
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMsg('Servicio eliminado');
      fetchServices();
    } else {
      showMsg('❌ No se puede eliminar: tiene citas asociadas');
    }
  };

  return (
    <div className="animate-fade-in">
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1000,
          padding: '14px 20px', borderRadius: '10px', fontWeight: '500',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)',
          color: '#a5b4fc', backdropFilter: 'blur(12px)',
        }}>{toast}</div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>Servicios</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gestiona los servicios que ofrece tu negocio</p>
        </div>
        <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✚ Nuevo Servicio
        </button>
      </header>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setShowForm(false)}>
          <div className="glass-panel" style={{ padding: '40px', maxWidth: '480px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px' }}>
              {editingId ? '✂️ Editar Servicio' : '✚ Nuevo Servicio'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Nombre del Servicio *</label>
                <input className="input-field" placeholder="Ej. Corte Clásico" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Descripción</label>
                <input className="input-field" placeholder="Ej. Corte + lavado de cabello" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Precio ($) *</label>
                  <input className="input-field" type="number" min="0" step="0.01" placeholder="15.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Duración (min) *</label>
                  <input className="input-field" type="number" min="5" step="5" placeholder="30" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px' }} disabled={submitting}>
                  {submitting ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando servicios...</div>
        ) : services.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✂️</div>
            <p style={{ marginBottom: '20px' }}>No hay servicios configurados</p>
            <button className="btn-primary" onClick={openCreate}>✚ Crear primer servicio</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                {['Servicio', 'Descripción', 'Precio', 'Duración', 'Acciones'].map((h) => (
                  <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} style={{ borderBottom: '1px solid var(--surface-border)', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{service.name}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>{service.description || '—'}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ fontWeight: '700', fontSize: '18px' }} className="gradient-text">${service.price}</span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>⏱ {service.duration} min</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => openEdit(service)}>Editar</button>
                      <button style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}
                        onClick={() => deleteService(service.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
