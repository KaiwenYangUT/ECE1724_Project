import { z } from "zod";

const ticketQrPayloadSchema = z.object({
  type: z.literal("ticket_checkin"),
  eventId: z.string().trim().min(1),
  token: z.string().trim().min(1),
});

export type TicketQrPayload = z.infer<typeof ticketQrPayloadSchema>;

export function encodeTicketQrPayload(eventId: string, token: string): string {
  return JSON.stringify({
    type: "ticket_checkin",
    eventId,
    token,
  } satisfies TicketQrPayload);
}

export function decodeTicketQrPayload(value: string): TicketQrPayload | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(trimmedValue);
    const parsedPayload = ticketQrPayloadSchema.safeParse(parsedValue);

    return parsedPayload.success ? parsedPayload.data : null;
  } catch {
    return null;
  }
}

export function extractTicketTokenFromQrValue(value: string) {
  const structuredPayload = decodeTicketQrPayload(value);

  if (structuredPayload) {
    return {
      token: structuredPayload.token,
      eventId: structuredPayload.eventId,
      isStructuredPayload: true,
    };
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return {
    token: trimmedValue,
    eventId: null,
    isStructuredPayload: false,
  };
}
