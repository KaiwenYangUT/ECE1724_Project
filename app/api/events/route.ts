import { NextResponse, NextRequest } from "next/server";


import { z } from "zod";

import prisma from "@/lib/prisma";


import { verifyToken } from "@/lib/auth/jwt";


// Try to get JWT token from Authorization header first.
// If not found, then try to get it from cookies.
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return request.cookies.get("token")?.value ?? null;
}

// Validate the request body for event creation.
const createEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  dateTime: z.string().trim().min(1, "Date and time are required"),
  location: z.string().trim().min(1, "Location is required"),

  // Optional, but if provided must be a valid URL
  bannerImageUrl: z.string().trim().url("Banner image URL must be valid").optional().or(z.literal("")),
  ticketTiers: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Ticket tier name is required"),
        price: z.coerce.number().min(0, "Price cannot be negative"),
        quantityLimit: z.coerce.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one ticket tier is required"),
});


// Return all events so users can browse available events and ticket tiers.
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { dateTime: "asc" },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTiers: {
          include: {
            _count: {
              select: { tickets: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        events: events.map((event: (typeof events)[number]) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          dateTime: event.dateTime,
          location: event.location,
          bannerImageUrl: event.bannerImageUrl,
          createdAt: event.createdAt,
          organizer: event.organizer,
          ticketTiers: event.ticketTiers.map((tier: (typeof event.ticketTiers)[number])=> ({
            id: tier.id,
            name: tier.name,
            price: Number(tier.price),
            quantityLimit: tier.quantityLimit,
            soldCount: tier._count.tickets,
            remaining: Math.max(tier.quantityLimit - tier._count.tickets, 0),
          })),
        })),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch events. Please try again later." },
      { status: 500 },
    );
  }
}


// Create a new event for only logged-in organizers.
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to create an event." },
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

    if (payload.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizer accounts can create events." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Some event fields are invalid.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { title, description, dateTime, location, bannerImageUrl, ticketTiers } = parsed.data;

    const parsedDate = new Date(dateTime);
    
    // Valid dates
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "The event date and time format is invalid." },
        { status: 400 },
      );
    }

    // Prevent creating events in the past
    if (parsedDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "The event date and time must be in the future." },
        { status: 400 },
      );
    }

    // Double check organizer identity
    const organizer = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true },
    });

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer account was not found." },
        { status: 404 },
      );
    }

    if (organizer.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizer accounts can create events." },
        { status: 403 },
      );
    }

    // Create the event and all of its ticket tiers in one database call
    const event = await prisma.event.create({
      data: {
        title,
        description,
        dateTime: parsedDate,
        location,
        bannerImageUrl: bannerImageUrl || null,
        organizerId: organizer.id,
        ticketTiers: {
          create: ticketTiers.map((tier) => ({
            name: tier.name,
            price: tier.price,
            quantityLimit: tier.quantityLimit,
          })),
        },
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ticketTiers: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Event created successfully.",
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          dateTime: event.dateTime,
          location: event.location,
          bannerImageUrl: event.bannerImageUrl,
          organizer: event.organizer,
          ticketTiers: event.ticketTiers.map((tier: (typeof event.ticketTiers)[number]) => ({
            id: tier.id,
            name: tier.name,
            price: Number(tier.price),
            quantityLimit: tier.quantityLimit,
          })),
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create event. Please try again later." },
      { status: 500 },
    );
  }
}
