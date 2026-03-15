import Link from "next/link";

import MyTicketsList from "@/components/MyTicketsList";

export default function MyTicketsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">My Tickets</h1>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Back To Home
        </Link>
      </div>

      <MyTicketsList />
    </main>
  );
}
