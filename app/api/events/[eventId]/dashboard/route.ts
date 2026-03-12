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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to view event dashboard." },
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

    if (payload.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizers can view event dashboard." },
        { status: 403 }
      );
    }

    const { eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is missing." },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tickets: true,
        ticketTiers: {
          include: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    if (event.organizerId !== payload.sub) {
      return NextResponse.json(
        { error: "You can only manage events created by your own account." },
        { status: 403 }
      );
    }

    const totalSold = event.tickets.length;
    const totalCheckedIn = event.tickets.filter(
      (ticket) => ticket.checkInStatus
    ).length;
    const totalNotCheckedIn = totalSold - totalCheckedIn;
    const checkInRate =
      totalSold > 0
        ? Number(((totalCheckedIn / totalSold) * 100).toFixed(1))
        : 0;

    const tierStats = event.ticketTiers.map((tier) => {
      const sold = tier.tickets.length;
      const checkedIn = tier.tickets.filter(
        (ticket) => ticket.checkInStatus
      ).length;
      const remaining = Math.max(tier.quantityLimit - sold, 0);

      return {
        id: tier.id,
        name: tier.name,
        price: Number(tier.price),
        quantityLimit: tier.quantityLimit,
        sold,
        checkedIn,
        remaining,
      };
    });

    return NextResponse.json(
      {
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          dateTime: event.dateTime,
          location: event.location,
          organizer: event.organizer,
        },
        stats: {
          totalSold,
          totalCheckedIn,
          totalNotCheckedIn,
          checkInRate,
        },
        tierStats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Failed to load event dashboard." },
      { status: 500 }
    );
  }
}