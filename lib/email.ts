type RegistrationConfirmationEmailInput = {
  name: string;
  email: string;
  role: "ORGANIZER" | "STAFF" | "ATTENDEE";
};

type TicketPurchaseConfirmationEmailInput = {
  name: string;
  email: string;
  event: {
    title: string;
    dateTime: Date;
    location: string;
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
  };
  pdfAttachment?: {
    filename: string;
    content: Uint8Array;
  };
};

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
    appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  };
}

async function sendTransactionalEmail({
  to,
  subject,
  html,
  missingConfigMessage,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  missingConfigMessage: string;
  attachments?: {
    filename: string;
    content: Uint8Array;
  }[];
}) {
  const config = getEmailConfig();

  if (!config.apiKey || !config.from) {
    console.warn(missingConfigMessage);
    return { sent: false, skipped: true as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: [to],
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content).toString("base64"),
      })),
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `Failed to send transactional email: ${response.status} ${responseText}`,
    );
  }

  return { sent: true as const, skipped: false as const };
}

function buildRegistrationConfirmationHtml({
  name,
  role,
  appBaseUrl,
}: {
  name: string;
  role: RegistrationConfirmationEmailInput["role"];
  appBaseUrl: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h1 style="margin-bottom: 12px;">Welcome to Event Ticketing</h1>
      <p>Hello ${name},</p>
      <p>Your account has been created successfully.</p>
      <p><strong>Role:</strong> ${role}</p>
      <p>You can now sign in and start using the platform.</p>
      <p>
        <a
          href="${appBaseUrl}"
          style="display: inline-block; margin-top: 8px; border-radius: 8px; background: #111827; color: #ffffff; padding: 10px 16px; text-decoration: none;"
        >
          Open The App
        </a>
      </p>
    </div>
  `;
}

export async function sendRegistrationConfirmationEmail({
  name,
  email,
  role,
}: RegistrationConfirmationEmailInput) {
  const config = getEmailConfig();

  return sendTransactionalEmail({
    to: email,
    subject: "Welcome to Event Ticketing",
    html: buildRegistrationConfirmationHtml({
      name,
      role,
      appBaseUrl: config.appBaseUrl,
    }),
    missingConfigMessage:
      "Registration confirmation email skipped because RESEND_API_KEY or EMAIL_FROM is missing.",
  });
}

function buildTicketPurchaseConfirmationHtml({
  name,
  event,
  ticketTier,
  ticket,
}: {
  name: string;
  event: TicketPurchaseConfirmationEmailInput["event"];
  ticketTier: TicketPurchaseConfirmationEmailInput["ticketTier"];
  ticket: TicketPurchaseConfirmationEmailInput["ticket"];
}) {
  const formattedDate = event.dateTime.toLocaleString();
  const formattedPrice = `$${ticketTier.price.toFixed(2)}`;
  const formattedPurchaseTime = ticket.createdAt.toLocaleString();

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h1 style="margin-bottom: 12px;">Your Ticket Purchase Is Confirmed</h1>
      <p>Hello ${name},</p>
      <p>Thank you for your purchase. Your ticket is now ready.</p>
      <p><strong>Event:</strong> ${event.title}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Ticket Tier:</strong> ${ticketTier.name}</p>
      <p><strong>Price:</strong> ${formattedPrice}</p>
      <p><strong>Purchased:</strong> ${formattedPurchaseTime}</p>
      <p><strong>Ticket Token:</strong> ${ticket.qrCodeToken}</p>
      <p><strong>Your QR Code:</strong> In the attached PDF ticket or access it in the app.</p>
      <p style="margin-top: 16px;">Please keep this email or open the app to access your ticket at check-in.</p>
    </div>
  `;
}

export async function sendTicketPurchaseConfirmationEmail({
  name,
  email,
  event,
  ticketTier,
  ticket,
  pdfAttachment,
}: TicketPurchaseConfirmationEmailInput) {
  return sendTransactionalEmail({
    to: email,
    subject: `Ticket confirmed: ${event.title}`,
    html: buildTicketPurchaseConfirmationHtml({
      name,
      event,
      ticketTier,
      ticket,
    }),
    missingConfigMessage:
      "Ticket purchase confirmation email skipped because RESEND_API_KEY or EMAIL_FROM is missing.",
    attachments: pdfAttachment ? [pdfAttachment] : undefined,
  });
}
