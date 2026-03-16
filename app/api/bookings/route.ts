import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/bookings?businessSlug=demo-barbershop&date=2024-01-15
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessSlug = searchParams.get('businessSlug');
  const date = searchParams.get('date');

  if (!businessSlug) {
    return NextResponse.json({ error: 'businessSlug es requerido' }, { status: 400 });
  }

  try {
    const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const whereClause: { businessId: string; startTime?: { gte: Date; lt: Date } } = { businessId: business.id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.startTime = { gte: startOfDay, lt: endOfDay };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { service: true },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/bookings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessSlug, serviceId, clientName, clientPhone, startTime } = body;

    if (!businessSlug || !serviceId || !clientName || !clientPhone || !startTime) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration * 60 * 1000);

    // Check for conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        businessId: business.id,
        status: { not: 'CANCELLED' },
        OR: [
          { startTime: { gte: start, lt: end } },
          { endTime: { gt: start, lte: end } },
          { startTime: { lte: start }, endTime: { gte: end } },
        ],
      },
    });

    if (conflict) {
      return NextResponse.json({ error: 'Ya existe una cita en ese horario' }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        clientName,
        clientPhone,
        startTime: start,
        endTime: end,
        businessId: business.id,
        serviceId: service.id,
        status: 'PENDING',
      },
      include: { service: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
