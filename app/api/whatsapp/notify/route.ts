import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/whatsapp/notify
// Sends a WhatsApp message via wa.me link generation (or CallMeBot if configured)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, type } = body; // type: 'confirmation' | 'reminder' | 'cancellation' | 'custom'

    if (!bookingId || !type) {
      return NextResponse.json({ error: 'bookingId y type son requeridos' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, business: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    const dateStr = booking.startTime.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = booking.startTime.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let message = '';

    switch (type) {
      case 'confirmation':
        message = `✅ *¡Cita Confirmada!*\n\nHola ${booking.clientName} 👋\n\nTu cita ha sido confirmada:\n\n📋 *Servicio:* ${booking.service.name}\n📅 *Fecha:* ${dateStr}\n⏰ *Hora:* ${timeStr}\n💰 *Precio:* $${booking.service.price}\n\n📍 *${booking.business.name}*\n\n¡Te esperamos! Si necesitas reprogramar, contáctanos.\n\n_Powered by Bookify_ 🚀`;
        break;
      case 'reminder':
        message = `⏰ *Recordatorio de Cita*\n\nHola ${booking.clientName} 👋\n\n¡Tu cita es próximamente!\n\n📋 *Servicio:* ${booking.service.name}\n📅 *Fecha:* ${dateStr}\n⏰ *Hora:* ${timeStr}\n\n📍 *${booking.business.name}*\n\nTe esperamos puntual. 😊`;
        break;
      case 'cancellation':
        message = `❌ *Cita Cancelada*\n\nHola ${booking.clientName},\n\nLamentamos informarte que tu cita ha sido cancelada:\n\n📋 *Servicio:* ${booking.service.name}\n📅 *Fecha:* ${dateStr}\n⏰ *Hora:* ${timeStr}\n\nPara reagendar, visita nuestro portal o contáctanos directamente.\n\n_${booking.business.name}_`;
        break;
      default:
        message = `Hola ${booking.clientName}, te contactamos desde ${booking.business.name} por tu cita del ${dateStr} a las ${timeStr}.`;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = booking.clientPhone.replace(/[\s\-\(\)]/g, '');
    const phone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;

    // Generate wa.me link for opening WhatsApp
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    // Check if CallMeBot API is configured
    const callMeBotApiKey = process.env.CALLMEBOT_API_KEY;

    if (callMeBotApiKey && phone) {
      // Send automatically via CallMeBot
      const apiUrl = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${callMeBotApiKey}`;

      try {
        const response = await fetch(apiUrl);
        const responseText = await response.text();

        // Log notification
        await prisma.notification.create({
          data: {
            bookingId: booking.id,
            type: type.toUpperCase(),
            message,
            channel: 'WHATSAPP',
            status: response.ok ? 'SENT' : 'FAILED',
          },
        });

        return NextResponse.json({
          success: response.ok,
          method: 'callmebot',
          responseText,
          waLink,
        });
      } catch {
        // Fall through to manual method
      }
    }

    // If no API key, return the wa.me link for manual sending
    // Still log the notification attempt
    await prisma.notification.create({
      data: {
        bookingId: booking.id,
        type: type.toUpperCase(),
        message,
        channel: 'WHATSAPP',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      method: 'manual',
      waLink,
      message,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al procesar la notificación' }, { status: 500 });
  }
}
