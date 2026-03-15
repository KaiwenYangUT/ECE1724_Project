import { PDFDocument, PDFPage, StandardFonts, rgb } from "pdf-lib";

export type TicketPdfData = {
  attendee: {
    name: string;
    email: string;
  };
  event: {
    title: string;
    description: string;
    dateTime: Date;
    location: string;
    organizerName: string;
  };
  ticketTier: {
    name: string;
    price: number;
  };
  ticket: {
    id: string;
    qrCodeToken: string;
    qrCodeDataUrl: string | null;
    createdAt: Date;
    checkInStatus: boolean;
    checkInTime: Date | null;
  };
};

function drawLabelValueRow({
  page,
  label,
  value,
  y,
  labelFont,
  valueFont,
}: {
  page: PDFPage;
  label: string;
  value: string;
  y: number;
  labelFont: Awaited<ReturnType<PDFDocument["embedFont"]>>;
  valueFont: Awaited<ReturnType<PDFDocument["embedFont"]>>;
}) {
  page.drawText(label, {
    x: 56,
    y,
    size: 11,
    font: labelFont,
    color: rgb(0.15, 0.23, 0.34),
  });

  page.drawText(value, {
    x: 170,
    y,
    size: 11,
    font: valueFont,
    color: rgb(0.06, 0.09, 0.16),
  });
}

function dataUrlToBytes(dataUrl: string) {
  const [, base64Payload] = dataUrl.split(",", 2);

  if (!base64Payload) {
    throw new Error("Invalid QR code data URL.");
  }

  return Buffer.from(base64Payload, "base64");
}

export function createTicketPdfFilename(eventTitle: string, ticketId: string) {
  const normalizedTitle = eventTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `${normalizedTitle || "ticket"}-${ticketId}.pdf`;
}

export async function generateTicketPdf(ticketData: TicketPdfData) {
  const pdfDocument = await PDFDocument.create();
  const page = pdfDocument.addPage([612, 792]);
  const titleFont = await pdfDocument.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDocument.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 36,
    y: 36,
    width: 540,
    height: 720,
    borderWidth: 1.5,
    borderColor: rgb(0.8, 0.84, 0.9),
    color: rgb(0.99, 0.99, 1),
  });

  page.drawText("Event Ticket", {
    x: 56,
    y: 718,
    size: 26,
    font: titleFont,
    color: rgb(0.06, 0.09, 0.16),
  });

  page.drawText(ticketData.event.title, {
    x: 56,
    y: 682,
    size: 18,
    font: titleFont,
    color: rgb(0.11, 0.17, 0.3),
  });

  const eventDescription = ticketData.event.description.slice(0, 180);
  page.drawText(eventDescription, {
    x: 56,
    y: 654,
    size: 10,
    font: bodyFont,
    color: rgb(0.3, 0.37, 0.47),
    maxWidth: 320,
    lineHeight: 14,
  });

  drawLabelValueRow({
    page,
    label: "Attendee",
    value: `${ticketData.attendee.name} (${ticketData.attendee.email})`,
    y: 592,
    labelFont: titleFont,
    valueFont: bodyFont,
  });
  drawLabelValueRow({
    page,
    label: "Organizer",
    value: ticketData.event.organizerName,
    y: 568,
    labelFont: titleFont,
    valueFont: bodyFont,
  });
  drawLabelValueRow({
    page,
    label: "Date",
    value: ticketData.event.dateTime.toLocaleString(),
    y: 544,
    labelFont: titleFont,
    valueFont: bodyFont,
  });
  drawLabelValueRow({
    page,
    label: "Location",
    value: ticketData.event.location,
    y: 520,
    labelFont: titleFont,
    valueFont: bodyFont,
  });
  drawLabelValueRow({
    page,
    label: "Ticket Tier",
    value: ticketData.ticketTier.name,
    y: 496,
    labelFont: titleFont,
    valueFont: bodyFont,
  });
  drawLabelValueRow({
    page,
    label: "Price",
    value: `$${ticketData.ticketTier.price.toFixed(2)}`,
    y: 472,
    labelFont: titleFont,
    valueFont: bodyFont,
  });
  drawLabelValueRow({
    page,
    label: "Purchased",
    value: ticketData.ticket.createdAt.toLocaleString(),
    y: 448,
    labelFont: titleFont,
    valueFont: bodyFont,
  });
  drawLabelValueRow({
    page,
    label: "Status",
    value: ticketData.ticket.checkInStatus
      ? `Checked In${ticketData.ticket.checkInTime ? ` at ${ticketData.ticket.checkInTime.toLocaleString()}` : ""}`
      : "Valid",
    y: 424,
    labelFont: titleFont,
    valueFont: bodyFont,
  });

  page.drawText("Ticket Token", {
    x: 56,
    y: 378,
    size: 12,
    font: titleFont,
    color: rgb(0.06, 0.09, 0.16),
  });
  page.drawText(ticketData.ticket.qrCodeToken, {
    x: 56,
    y: 358,
    size: 10,
    font: bodyFont,
    color: rgb(0.3, 0.37, 0.47),
    maxWidth: 310,
  });

  if (ticketData.ticket.qrCodeDataUrl) {
    const qrBytes = dataUrlToBytes(ticketData.ticket.qrCodeDataUrl);
    const qrImage = ticketData.ticket.qrCodeDataUrl.startsWith("data:image/jpeg")
      ? await pdfDocument.embedJpg(qrBytes)
      : await pdfDocument.embedPng(qrBytes);

    page.drawRectangle({
      x: 382,
      y: 354,
      width: 170,
      height: 170,
      borderWidth: 1,
      borderColor: rgb(0.85, 0.88, 0.92),
      color: rgb(1, 1, 1),
    });

    page.drawImage(qrImage, {
      x: 397,
      y: 369,
      width: 140,
      height: 140,
    });
  }

  page.drawText("Present this PDF or the ticket QR code at check-in.", {
    x: 56,
    y: 92,
    size: 10,
    font: bodyFont,
    color: rgb(0.3, 0.37, 0.47),
  });

  return pdfDocument.save();
}
