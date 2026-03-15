# Event Ticketing Platform

This repository contains the Event Ticketing and QR Check-in System built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Progress Overview

Current status:

- ✅ 1. app setup
- ✅ 2. database schema
- ✅ 3. auth + roles
- ✅ 4. event management
- ✅ 5. ticket purchase/registration
- ✅ 6. QR generation
- ⏳ 7. QR validation
- ⏳ 8. check-in logic
- ✅ 9. real-time dashboard
- ⏳ 10. cloud file storage
- ✅ 11. analytics/reporting
- ⏳ 12. extra features
- ⏳ 13. testing + deployment

## What Is Already Implemented (Steps 1-3)

- Next.js App Router project structure with TypeScript
- Prisma + PostgreSQL connection and migration setup
- `User` model with role support (`ORGANIZER`, `STAFF`, `ATTENDEE`)
- Authentication utilities:
	- password hashing/verification
	- JWT generation/verification
	- registration confirmation email support via Resend
- Ticket purchase confirmation email support via Resend
- PDF ticket generation for download and email attachments
- Auth APIs:
	- `POST /api/auth/register`
	- `POST /api/auth/login`
- Protected route middleware with role-based checks

- Event CRUD management (create/update/list/details)
- Ticket purchase/registration flow
- Real-time organizer/staff dashboard with 
- Analytics/reporting endpoints and UI


## What Is Left To Implement (Steps 4-12)


- QR code generation and ticket binding
- Check-in workflow and validation logic

- Cloud file upload and storage for event assets
- Extra features and polish
- Full testing strategy and deployment pipeline

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment in `.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/event_ticketing"
JWT_SECRET="change-this-in-production"
RESEND_API_KEY="re_..."
EMAIL_FROM="Event Ticketing <onboarding@resend.dev>"
APP_BASE_URL="http://localhost:3000"
```

3. Run migrations

```bash
npx prisma migrate dev
```

4. Start the app

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Team Notes

- If you add or change Prisma models, run:

```bash
npx prisma migrate dev --name <migration_name>
```

- After schema changes, regenerate Prisma client if needed:

```bash
npx prisma generate
```
