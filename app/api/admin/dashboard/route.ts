import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type BookingWithService = { status: string; service: { price: number }; clientPhone: string; [key: string]: unknown };

// GET /api/admin/dashboard?businessSlug=demo-barbershop
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessSlug = searchParams.get('businessSlug') || 'demo-barbershop';

  try {
    const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayBookings, totalBookings, cancelledToday, upcomingBookings] = await Promise.all([
      prisma.booking.findMany({
        where: { businessId: business.id, startTime: { gte: today, lt: tomorrow } },
        include: { service: true },
        orderBy: { startTime: 'asc' },
      }),
      prisma.booking.count({ where: { businessId: business.id, status: { not: 'CANCELLED' } } }),
      prisma.booking.count({
        where: { businessId: business.id, status: 'CANCELLED', startTime: { gte: today, lt: tomorrow } },
      }),
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          startTime: { gte: new Date() },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: { service: true },
        orderBy: { startTime: 'asc' },
        take: 10,
      }),
    ]);

    const todayRevenue = (todayBookings as BookingWithService[])
      .filter((b: BookingWithService) => b.status !== 'CANCELLED')
      .reduce((sum: number, b: BookingWithService) => sum + b.service.price, 0);

    const newClientsToday = new Set(
      (todayBookings as BookingWithService[]).filter((b: BookingWithService) => b.status !== 'CANCELLED').map((b: BookingWithService) => b.clientPhone)
    ).size;

    return NextResponse.json({
      business,
      stats: {
        todayBookingsCount: (todayBookings as BookingWithService[]).filter((b: BookingWithService) => b.status !== 'CANCELLED').length,
        todayRevenue,
        newClientsToday,
        cancelledToday,
        totalBookings,
      },
      todayBookings,
      upcomingBookings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
