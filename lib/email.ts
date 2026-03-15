type RegistrationConfirmationEmailInput = {
  name: string;
  email: string;
  role: "ORGANIZER" | "STAFF" | "ATTENDEE";
};

function getEmailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
    appBaseUrl: process.env.APP_BASE_URL || "http://localhost:3000",
  };
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

  if (!config.apiKey || !config.from) {
    console.warn(
      "Registration confirmation email skipped because RESEND_API_KEY or EMAIL_FROM is missing.",
    );
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
      to: [email],
      subject: "Welcome to Event Ticketing",
      html: buildRegistrationConfirmationHtml({
        name,
        role,
        appBaseUrl: config.appBaseUrl,
      }),
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();

    throw new Error(
      `Failed to send registration confirmation email: ${response.status} ${responseText}`,
    );
  }

  return { sent: true as const, skipped: false as const };
}
