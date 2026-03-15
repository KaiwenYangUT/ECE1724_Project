import { NextRequest, NextResponse } from "next/server";

import { verifyToken } from "@/lib/auth/jwt";
import prisma from "@/lib/prisma";
import { createTicketPdfFilename, generateTicketPdf } from "@/lib/tickets/pdf";

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return request.cookies.get("token")?.value ?? null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticketId: string }> },
) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to download a ticket PDF." },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Your session is invalid or expired. Please log in again." },
        { status: 401 },
      );
    }

    const { ticketId } = await context.params;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is missing." },
        { status: 400 },
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            dateTime: true,
            location: true,
            organizer: {
              select: {
                name: true,
              },
            },
          },
        },
        ticketTier: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    if (ticket.userId !== payload.sub) {
      return NextResponse.json(
        { error: "You can only download PDF tickets that belong to your account." },
        { status: 403 },
      );
    }

    const pdfBytes = await generateTicketPdf({
      attendee: {
        name: ticket.user.name,
        email: ticket.user.email,
      },
      event: {
        title: ticket.event.title,
        description: ticket.event.description,
        dateTime: ticket.event.dateTime,
        location: ticket.event.location,
        organizerName: ticket.event.organizer.name,
      },
      ticketTier: {
        name: ticket.ticketTier.name,
        price: Number(ticket.ticketTier.price),
      },
      ticket: {
        id: ticket.id,
        qrCodeToken: ticket.qrCodeToken,
        qrCodeDataUrl: ticket.qrCodeDataUrl,
        createdAt: ticket.createdAt,
        checkInStatus: ticket.checkInStatus,
        checkInTime: ticket.checkInTime,
      },
    });

    const filename = createTicketPdfFilename(ticket.event.title, ticket.id);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Ticket PDF download error:", error);

    return NextResponse.json(
      { error: "Failed to generate the ticket PDF." },
      { status: 500 },
    );
  }
}
