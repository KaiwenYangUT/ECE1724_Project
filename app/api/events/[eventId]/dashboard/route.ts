import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { z } from "zod";

// Get token from header first, then fall back to cookie.
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return request.cookies.get("token")?.value ?? null;
}

// Validate the staff assignment request body.
const assignStaffSchema = z.object({
  userId: z.string().trim().min(1, "Staff user ID is required"),
});

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

    // Only organizers can open this dashboard.
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

    // Load event details and ticket data for dashboard stats.
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
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    // Organizer can only manage their own events.
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

    // Build stats for each ticket tier.
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

    const staffUsers = await prisma.user.findMany({
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
        staffOptions: staffUsers,
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

export async function POST(
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

    // Only organizers can assign staff.
    if (payload.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizers can assign staff." },
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

    const body = await request.json();
    const parsed = assignStaffSchema.safeParse(body);

    // Reject invalid request body.
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid staff assignment data.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    // Check the event and confirm ownership.
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organizerId: true,
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
        { error: "You can only assign staff to your own events." },
        { status: 403 }
      );
    }

    // Check the selected user exists and is STAFF.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Selected user was not found." },
        { status: 404 }
      );
    }

    if (user.role !== "STAFF") {
      return NextResponse.json(
        { error: "Only users with STAFF role can be assigned." },
        { status: 400 }
      );
    }
    //check if this staff have been assigned to this event
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
        { status: 409 }
      );
    }
    // Create the event-staff link.
    await prisma.eventStaff.create({
      data: {
        eventId,
        userId,
      },
    });

    return NextResponse.json(
      {
        message: "Staff assigned successfully.",
        assignedStaff: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Assign staff API error:", error);

    return NextResponse.json(
      { error: "Failed to assign staff." },
      { status: 500 }
    );
  }
}