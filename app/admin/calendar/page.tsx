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

const BUSINESS_SLUG = 'demo-barbershop';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#6366f1',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'month' | 'day'>('month');

  const fetchBookingsForDate = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const res = await fetch(`/api/bookings?businessSlug=${BUSINESS_SLUG}&date=${dateStr}`);
      const data = await res.json();
      if (Array.isArray(data)) setBookings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookingsForDate(selectedDate);
  }, [selectedDate, fetchBookingsForDate]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) => {
    const t = new Date();
    return t.getDate() === day && t.getMonth() === month && t.getFullYear() === year;
  };
  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const selectDay = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setView('day');
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am - 7pm

  const getBookingsForHour = (hour: number) => {
    return bookings.filter((b) => {
      const bHour = new Date(b.startTime).getHours();
      return bHour === hour;
    });
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>Calendario</h1>
          <p style={{ color: 'var(--text-muted)' }}>Vista de citas por día y mes</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={view === 'month' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setView('month')}>
            📅 Mes
          </button>
          <button className={view === 'day' ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setView('day')}>
            ☀️ Día
          </button>
        </div>
      </header>

      {view === 'month' ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={prevMonth}>← Anterior</button>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>{MONTHS[month]} {year}</h2>
            <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={nextMonth}>Siguiente →</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', padding: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <div
                key={day}
                onClick={() => selectDay(day)}
                style={{
                  padding: '10px 4px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                  background: isSelected(day) ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : isToday(day) ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.1)',
                  border: isToday(day) && !isSelected(day) ? '1px solid var(--primary)' : '1px solid transparent',
                  fontWeight: isToday(day) || isSelected(day) ? '700' : '400',
                  transition: 'var(--transition)',
                }}
              >
                <span style={{ fontSize: '15px' }}>{day}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
            💡 Haz clic en un día para ver las citas agendadas para esa fecha
          </div>
        </div>
      ) : (
        <div>
          {/* Day view header */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-secondary" style={{ fontSize: '14px', padding: '8px 14px' }}
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); setCurrentDate(d); }}>
              ← Anterior
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '20px' }}>
                {selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {loading ? 'Cargando...' : `${bookings.filter(b => b.status !== 'CANCELLED').length} citas`}
              </div>
            </div>
            <button className="btn-secondary" style={{ fontSize: '14px', padding: '8px 14px' }}
              onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); setCurrentDate(d); }}>
              Siguiente →
            </button>
          </div>

          {/* Time slots */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Cargando citas...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {hours.map((hour) => {
                  const hourBookings = getBookingsForHour(hour);
                  return (
                    <div key={hour} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '16px', borderBottom: '1px solid var(--surface-border)', minHeight: '60px' }}>
                      <div style={{ paddingTop: '8px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>
                        {hour}:00
                      </div>
                      <div style={{ padding: '6px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {hourBookings.map((booking) => (
                          <div key={booking.id} style={{
                            padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
                            background: `${STATUS_COLORS[booking.status]}15`,
                            borderLeft: `3px solid ${STATUS_COLORS[booking.status]}`,
                          }}>
                            <div style={{ fontWeight: '600' }}>{booking.clientName}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                              {booking.service.name} · {new Date(booking.startTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {new Date(booking.endTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <span style={{ fontSize: '11px', color: STATUS_COLORS[booking.status], fontWeight: '600' }}>
                              {STATUS_LABELS[booking.status]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
