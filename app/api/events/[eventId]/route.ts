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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to delete an event." },
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
        { error: "Only organizers can delete events." },
        { status: 403 }
      );
    }

    const resolvedParams = await context.params;
    console.log("DELETE params:", resolvedParams);

    const eventId = resolvedParams?.eventId;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is missing." },
        { status: 400 }
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
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    if (event.organizerId !== payload.sub) {
      return NextResponse.json(
        { error: "You can only delete events created by your own account." },
        { status: 403 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json(
      { message: "Event deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete event error:", error);

    return NextResponse.json(
      { error: "Failed to delete event. Please try again later." },
      { status: 500 }
    );
  }
}