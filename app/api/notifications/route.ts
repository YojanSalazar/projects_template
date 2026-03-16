import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/notifications?businessSlug=demo-barbershop&limit=20
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessSlug = searchParams.get('businessSlug') || 'demo-barbershop';
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        booking: { businessId: business.id },
      },
      include: {
        booking: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
