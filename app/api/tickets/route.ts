import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return request.cookies.get("token")?.value ?? null;
}

const purchaseSchema = z.object({
  eventId: z.string().trim().min(1, "Event ID is required"),
  ticketTierId: z.string().trim().min(1, "Ticket tier ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "You must be logged in to purchase a ticket." },
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

    const body = await request.json();
    const parsed = purchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Ticket purchase input is invalid.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { eventId, ticketTierId } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account was not found." },
        { status: 404 },
      );
    }
    //Find the ticket from that event
    const tier = await prisma.ticketTier.findUnique({
      where: { id: ticketTierId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            location: true,
          },
        },
      },
    });

    if (!tier) {
      return NextResponse.json(
        { error: "The selected ticket tier does not exist." },
        { status: 404 },
      );
    }

    if (tier.eventId !== eventId) {
      return NextResponse.json(
        { error: "The selected ticket tier does not belong to this event." },
        { status: 400 },
      );
    }

    if (tier.event.dateTime.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "This event has already started or ended, so tickets cannot be purchased." },
        { status: 400 },
      );
    }
    //purchase the ticket
    const purchasedTicket = await prisma.$transaction(async (tx) => {
      const existingTicket = await tx.ticket.findUnique({
        where: {
          userId_ticketTierId: {
            userId: user.id,
            ticketTierId: tier.id,
          },
        },
      });

      if (existingTicket) {
        throw new Error("DUPLICATE_PURCHASE");
      }

      const soldCount = await tx.ticket.count({
        where: { ticketTierId: tier.id },
      });

      if (soldCount >= tier.quantityLimit) {
        throw new Error("SOLD_OUT");
      }

      const qrCodeToken = randomUUID();
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeToken);
      
      //create the ticket that linked with the buyer and given QR code 
      return tx.ticket.create({
        data: {
          userId: user.id,
          eventId: tier.eventId,
          ticketTierId: tier.id,
          qrCodeToken,
          qrCodeDataUrl,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              dateTime: true,
              location: true,
            },
          },
          ticketTier: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        message: "Ticket purchased successfully.",
        ticket: {
          id: purchasedTicket.id,
          qrCodeToken: purchasedTicket.qrCodeToken,
          qrCodeDataUrl: purchasedTicket.qrCodeDataUrl,
          checkInStatus: purchasedTicket.checkInStatus,
          createdAt: purchasedTicket.createdAt,
          event: purchasedTicket.event,
          ticketTier: {
            id: purchasedTicket.ticketTier.id,
            name: purchasedTicket.ticketTier.name,
            price: Number(purchasedTicket.ticketTier.price),
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "DUPLICATE_PURCHASE") {
        return NextResponse.json(
          { error: "You have already purchased this ticket tier." },
          { status: 409 },
        );
      }

      if (error.message === "SOLD_OUT") {
        return NextResponse.json(
          { error: "This ticket tier is sold out." },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to purchase ticket. Please try again later." },
      { status: 500 },
    );
  }
}