import Link from "next/link";

import EventList from "@/components/EventList";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between gap-4 px-6 pt-10">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back To Home
        </Link>
      </div>
      <EventList />
    </main>
  );
}
