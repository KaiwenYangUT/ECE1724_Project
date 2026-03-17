# Event Ticketing Platform

This repository contains an Event Ticketing and QR Check-in System built with Next.js, TypeScript, Prisma, PostgreSQL, and Resend.

## Current Status

- ✅ App setup
- ✅ Database schema
- ✅ Authentication and roles
- ✅ Event management
- ✅ Ticket purchase and registration
- ✅ QR generation
- ✅ QR validation and check-in
- ✅ Real-time dashboard refresh with polling
- ✅ Analytics and reporting
- ✅ Registration confirmation email
- ✅ Ticket purchase confirmation email
- ✅ PDF ticket generation and download
- ✅ Cloud file storage
- ⏳ Extra polish
- ⏳ Testing and deployment

## Implemented Features

### Authentication and Roles

- Email/password registration and login
- Role support for `ORGANIZER`, `STAFF`, and `ATTENDEE`
- JWT-based authentication
- Role-aware route protection
- Registration confirmation email via Resend

### Event Management

- Organizer event creation with ticket tiers
- Event listing and event details
- Staff assignment to events
- Organizer/staff event dashboard

### Tickets

- Ticket purchase flow
- QR code generation for each ticket
- Structured QR payloads for scanning
- Manual token validation fallback
- Check-in flow for organizer/staff
- Real-time check-in stats refresh on the dashboard
- Ticket purchase confirmation email via Resend
- Downloadable PDF ticket documents
- PDF ticket attached to purchase confirmation email

### Dashboard and Reporting

- Ticket sales counts
- Check-in counts and percentage
- Per-tier sold / checked-in / remaining stats
- Recent check-ins list

### Cloud Storage and File Handling

- Organizer banner image upload during event creation
- File type and size validation for uploaded images
- Image upload via backend API
- Cloud storage using `DigitalOcean Spaces`
- Public image URL persisted in PostgreSQL through `bannerImageUrl`
- Event banner rendering in the event list UI

## Main Routes and APIs

### Pages

- `/`
- `/register`
- `/login`
- `/events`
- `/events/create`
- `/events/[eventId]/dashboard`
- `/my-tickets`

### APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/events`
- `POST /api/events`
- `DELETE /api/events/[eventId]`
- `GET /api/events/[eventId]/dashboard`
- `POST /api/events/[eventId]/dashboard`
- `PATCH /api/events/[eventId]/dashboard`
- `POST /api/tickets/purchase`
- `GET /api/users/me/tickets`
- `GET /api/tickets/[ticketId]/pdf`

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure `.env`

Create or update `.env` with:

```env
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/event_ticketing"
JWT_SECRET="change-this-in-production"
RESEND_API_KEY="re_your_own_resend_api_key"
EMAIL_FROM="Event Ticketing <onboarding@resend.dev>"
APP_BASE_URL="http://localhost:3000"

SPACES_BUCKET="ece1724-event-assets"
SPACES_REGION="nyc3"
SPACES_ENDPOINT="https://nyc3.digitaloceanspaces.com"
SPACES_KEY="your_spaces_access_key"
SPACES_SECRET="your_spaces_secret_key"
SPACES_PUBLIC_BASE_URL="https://ece1724-event-assets.nyc3.digitaloceanspaces.com"
```

### 3. Important `.env` notes

Some values are placeholders and must be changed locally. Some can usually stay the same for local development.

Must customize:

- `DATABASE_URL`
  - Each teammate must use their own local PostgreSQL username/password.
  - Example:
  ```env
  DATABASE_URL="postgresql://kevinyang:your_password@localhost:5432/event_ticketing"
  ```
- `RESEND_API_KEY`
  - Each teammate needs their own Resend API key if they want to test email features locally.

Usually should customize:

- `JWT_SECRET`
  - For local development, any non-empty secret works.
  - It does not need to match across teammates unless you are sharing tokens, which you are not.

Usually does not need to change for local development:

- `APP_BASE_URL`
  - Keep as `http://localhost:3000` unless you run the app on a different port.

May need to change depending on email setup:

- `EMAIL_FROM`
  - `Event Ticketing <onboarding@resend.dev>` is suitable for simple Resend testing only if Resend allows it for your account.
  - For reliable use, especially for real inbox delivery, use a verified sender/domain from your own Resend account.

## Resend Setup For Teammates

If a teammate wants registration emails or ticket purchase emails to work on their machine, they need their own Resend configuration.

### What each teammate needs

- A Resend account
- Their own `RESEND_API_KEY`
- A valid sender address for `EMAIL_FROM`

### How to get a Resend API key

1. Go to `https://resend.com`
2. Sign up or log in
3. Open the Resend dashboard
4. Go to `API Keys`
5. Create a new API key
6. Copy it into `.env` as:

```env
RESEND_API_KEY="re_your_own_resend_api_key"
```

### Sender address notes

- For quick testing, teammates can try:

```env
EMAIL_FROM="Event Ticketing <onboarding@resend.dev>"
```

- If Resend rejects sending or emails do not arrive reliably, they should verify their own domain in Resend and use something like:

```env
EMAIL_FROM="Event Ticketing <noreply@yourdomain.com>"
```

### Important

- Do not commit real Resend API keys to git.
- Do not share personal API keys inside the repository.
- Each teammate should keep their own `.env` local.

## Database Setup

### 1. Make sure PostgreSQL is running

Example on macOS with Homebrew:

```bash
brew services start postgresql@17
```

### 2. Create the database if needed

```bash
createdb event_ticketing
```

### 3. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 4. Start the app

```bash
npm run dev
```

Then open:

`http://localhost:3000`

## Email Feature Notes

### Registration confirmation email

- Sent immediately after successful account creation
- If Resend config is missing, registration still succeeds and email is skipped

### Ticket purchase confirmation email

- Sent immediately after successful ticket purchase
- Includes ticket details
- Includes the PDF ticket as an attachment
- If email sending fails, ticket purchase still succeeds

### Important when testing email changes

If you change `.env` or server-side email code, restart the dev server:

```bash
npm run dev
```

Otherwise the running app may still use stale config.

## PDF Ticket Notes

- Users can download their own ticket PDF from `My Tickets`
- The PDF includes:
  - attendee information
  - event title, description, date/time, and location
  - organizer name
  - ticket tier and price
  - ticket token
  - QR code
  - check-in status

## Team Notes

- If you add or change Prisma models, run:

```bash
npx prisma migrate dev --name <migration_name>
```

- If Prisma client needs regeneration:

```bash
npx prisma generate
```

- If you add new server-side env variables, document them in this README.
