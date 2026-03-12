import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return request.cookies.get("token")?.value ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to view your tickets." },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Your session is invalid or expired. Please log in again." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            dateTime: true,
            location: true,
            bannerImageUrl: true,
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        ticketTier: {
          select: {
            id: true,
            name: true,
            price: true,
            quantityLimit: true,
          },
        },
      },
    });

    const now = new Date();

    return NextResponse.json(
      {
        user,
        tickets: tickets.map((ticket) => {
          const isExpired = new Date(ticket.event.dateTime).getTime() < now.getTime();

          let displayStatus = "Valid";

          if (ticket.checkInStatus) {
            displayStatus = "Checked In";
          } else if (isExpired) {
            displayStatus = "Expired";
          }

          return {
            id: ticket.id,
            qrCodeToken: ticket.qrCodeToken,
            qrCodeDataUrl: ticket.qrCodeDataUrl,
            checkInStatus: ticket.checkInStatus,
            checkInTime: ticket.checkInTime,
            createdAt: ticket.createdAt,
            isExpired,
            displayStatus,
            event: {
              id: ticket.event.id,
              title: ticket.event.title,
              description: ticket.event.description,
              dateTime: ticket.event.dateTime,
              location: ticket.event.location,
              bannerImageUrl: ticket.event.bannerImageUrl,
              organizer: ticket.event.organizer,
            },
            ticketTier: {
              id: ticket.ticketTier.id,
              name: ticket.ticketTier.name,
              price: Number(ticket.ticketTier.price),
              quantityLimit: ticket.ticketTier.quantityLimit,
            },
          };
        }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get my tickets error:", error);

    return NextResponse.json(
      { error: "Failed to load your tickets. Please try again later." },
      { status: 500 }
    );
  }
}