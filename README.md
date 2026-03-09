# Event Ticketing Platform

This repository contains the Event Ticketing and QR Check-in System built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Progress Overview

Current status:

- ✅ 1. app setup
- ✅ 2. database schema
- ✅ 3. auth + roles
- ⏳ 4. event management
- ⏳ 5. ticket purchase/registration
- ⏳ 6. QR generation
- ⏳ 7. check-in logic
- ⏳ 8. real-time dashboard
- ⏳ 9. cloud file storage
- ⏳ 10. analytics/reporting
- ⏳ 11. extra features
- ⏳ 12. testing + deployment

## What Is Already Implemented (Steps 1-3)

- Next.js App Router project structure with TypeScript
- Prisma + PostgreSQL connection and migration setup
- `User` model with role support (`ORGANIZER`, `STAFF`, `ATTENDEE`)
- Authentication utilities:
	- password hashing/verification
	- JWT generation/verification
- Auth APIs:
	- `POST /api/auth/register`
	- `POST /api/auth/login`
- Protected route middleware with role-based checks

## What Is Left To Implement (Steps 4-12)

- Event CRUD management (create/update/list/details)
- Ticket purchase/registration flow
- QR code generation and ticket binding
- Check-in workflow and validation logic
- Real-time organizer/staff dashboard
- Cloud file upload and storage for event assets
- Analytics/reporting endpoints and UI
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
