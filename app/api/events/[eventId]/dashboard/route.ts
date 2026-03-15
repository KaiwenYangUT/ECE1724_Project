import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { verifyToken, type AuthTokenPayload } from "@/lib/auth/jwt";

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return request.cookies.get("token")?.value ?? null;
}

const assignStaffSchema = z.object({
  userId: z.string().trim().min(1, "Staff user ID is required"),
});

const checkInSchema = z.object({
  qrCodeToken: z.string().trim().min(1, "Ticket token is required"),
});

async function authenticateDashboardAccess(request: NextRequest) {
  const token = extractToken(request);

  if (!token) {
    return {
      error: NextResponse.json(
        { error: "You must be logged in to view event dashboard." },
        { status: 401 },
      ),
    };
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return {
      error: NextResponse.json(
        { error: "Your session is invalid or expired. Please log in again." },
        { status: 401 },
      ),
    };
  }

  if (payload.role === "ATTENDEE") {
    return {
      error: NextResponse.json(
        { error: "Only organizers/staff can view event dashboard." },
        { status: 403 },
      ),
    };
  }

  return { payload };
}

async function getManageableEvent(eventId: string, payload: AuthTokenPayload) {
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
      assignedStaff: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    return {
      error: NextResponse.json({ error: "Event not found." }, { status: 404 }),
    };
  }

  const isOrganizer = event.organizerId === payload.sub;
  const isAssignedStaff = event.assignedStaff.some(
    (assignment) => assignment.user.id === payload.sub,
  );

  if (!isOrganizer && !isAssignedStaff) {
    return {
      error: NextResponse.json(
        { error: "You can only manage events created by your own account." },
        { status: 403 },
      ),
    };
  }

  return { event, isOrganizer };
}

async function buildDashboardResponse(eventId: string, payload: AuthTokenPayload) {
  const manageableEvent = await getManageableEvent(eventId, payload);

  if ("error" in manageableEvent) {
    return manageableEvent;
  }

  const { event, isOrganizer } = manageableEvent;
  const totalSold = event.tickets.length;
  const totalCheckedIn = event.tickets.filter((ticket) => ticket.checkInStatus).length;
  const totalNotCheckedIn = totalSold - totalCheckedIn;
  const checkInRate =
    totalSold > 0 ? Number(((totalCheckedIn / totalSold) * 100).toFixed(1)) : 0;

  const tierStats = event.ticketTiers.map((tier) => {
    const sold = tier.tickets.length;
    const checkedIn = tier.tickets.filter((ticket) => ticket.checkInStatus).length;
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

  const recentCheckIns = await prisma.ticket.findMany({
    where: {
      eventId,
      checkInStatus: true,
    },
    orderBy: {
      checkInTime: "desc",
    },
    take: 8,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ticketTier: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const staffUsers = isOrganizer
    ? await prisma.user.findMany({
        where: {
          role: "STAFF",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  return {
    event: {
      id: event.id,
      title: event.title,
      description: event.description,
      dateTime: event.dateTime,
      location: event.location,
      organizer: event.organizer,
      assignedStaff: event.assignedStaff.map((assignment) => ({
        id: assignment.user.id,
        name: assignment.user.name,
        email: assignment.user.email,
        role: assignment.user.role,
      })),
    },
    stats: {
      totalSold,
      totalCheckedIn,
      totalNotCheckedIn,
      checkInRate,
    },
    tierStats,
    recentCheckIns: recentCheckIns.map((ticket) => ({
      id: ticket.id,
      qrCodeToken: ticket.qrCodeToken,
      checkInTime: ticket.checkInTime,
      attendee: ticket.user,
      ticketTier: ticket.ticketTier,
    })),
    staffOptions: staffUsers,
    permissions: {
      canAssignStaff: isOrganizer,
      canCheckInTickets: true,
    },
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const auth = await authenticateDashboardAccess(request);

    if (auth.error) {
      return auth.error;
    }

    const { eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is missing." }, { status: 400 });
    }

    const dashboard = await buildDashboardResponse(eventId, auth.payload);

    if ("error" in dashboard) {
      return dashboard.error;
    }

    return NextResponse.json(dashboard, { status: 200 });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { error: "Failed to load event dashboard." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const auth = await authenticateDashboardAccess(request);

    if (auth.error) {
      return auth.error;
    }

    if (auth.payload.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizers can assign staff." },
        { status: 403 },
      );
    }

    const { eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is missing." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = assignStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid staff assignment data.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organizerId: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (event.organizerId !== auth.payload.sub) {
      return NextResponse.json(
        { error: "You can only assign staff to your own events." },
        { status: 403 },
      );
    }

    const { userId } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Selected user was not found." },
        { status: 404 },
      );
    }

    if (user.role !== "STAFF") {
      return NextResponse.json(
        { error: "Only users with STAFF role can be assigned." },
        { status: 400 },
      );
    }

    const existingAssignment = await prisma.eventStaff.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "This staff member is already assigned to the event." },
        { status: 409 },
      );
    }

    await prisma.eventStaff.create({
      data: {
        eventId,
        userId,
      },
    });

    return NextResponse.json(
      { message: "Staff assigned successfully." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Assign staff API error:", error);

    return NextResponse.json(
      { error: "Failed to assign staff." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> },
) {
  try {
    const auth = await authenticateDashboardAccess(request);

    if (auth.error) {
      return auth.error;
    }

    const { eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is missing." }, { status: 400 });
    }

    const manageableEvent = await getManageableEvent(eventId, auth.payload);

    if ("error" in manageableEvent) {
      return manageableEvent.error;
    }

    const body = await request.json();
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid ticket validation data.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { qrCodeToken } = parsed.data;

    const ticket = await prisma.ticket.findUnique({
      where: { qrCodeToken },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Invalid ticket token. No ticket was found." },
        { status: 404 },
      );
    }

    if (ticket.eventId !== eventId) {
      return NextResponse.json(
        {
          error: `This ticket belongs to "${ticket.event.title}", not this event.`,
        },
        { status: 409 },
      );
    }

    if (ticket.checkInStatus) {
      return NextResponse.json(
        {
          error: "This ticket has already been checked in.",
          ticket: {
            id: ticket.id,
            attendee: ticket.user,
            ticketTier: ticket.ticketTier,
            checkInStatus: ticket.checkInStatus,
            checkInTime: ticket.checkInTime,
          },
        },
        { status: 409 },
      );
    }

    const now = new Date();

    const checkedInTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        checkInStatus: true,
        checkInTime: now,
      },
      select: {
        id: true,
        qrCodeToken: true,
        checkInStatus: true,
        checkInTime: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Ticket validated and checked in successfully.",
        ticket: {
          id: checkedInTicket.id,
          qrCodeToken: checkedInTicket.qrCodeToken,
          checkInStatus: checkedInTicket.checkInStatus,
          checkInTime: checkedInTicket.checkInTime,
          attendee: checkedInTicket.user,
          ticketTier: checkedInTicket.ticketTier,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Ticket validation API error:", error);

    return NextResponse.json(
      { error: "Failed to validate ticket." },
      { status: 500 },
    );
  }
}
