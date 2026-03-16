import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/services?businessSlug=demo-barbershop
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessSlug = searchParams.get('businessSlug');

  if (!businessSlug) {
    return NextResponse.json({ error: 'businessSlug es requerido' }, { status: 400 });
  }

  try {
    const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const services = await prisma.service.findMany({
      where: { businessId: business.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST /api/services — Create a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessSlug, name, description, price, duration } = body;

    if (!businessSlug || !name || !price || !duration) {
      return NextResponse.json({ error: 'Campos requeridos: businessSlug, name, price, duration' }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
    if (!business) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        duration: parseInt(duration),
        businessId: business.id,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear el servicio' }, { status: 500 });
  }
}
