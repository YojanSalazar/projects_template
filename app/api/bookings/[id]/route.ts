import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/bookings/[id] — Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id: resolvedParams.id },
      data: { status },
      include: { service: true, business: true },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al actualizar la cita' }, { status: 500 });
  }
}

// DELETE /api/bookings/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await prisma.booking.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ message: 'Cita eliminada' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al eliminar la cita' }, { status: 500 });
  }
}
