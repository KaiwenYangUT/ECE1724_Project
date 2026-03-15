import Link from "next/link";

import CreateEventForm from "@/components/CreateEventForm";

export default function CreateEventPage() {
  return (
    // Main page container for the event creation feature
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Create Event</h1>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back To Home
          </Link>
        </div>
        <CreateEventForm />
      </div>
    </main>
  );
}
