import MyTicketsList from "@/components/MyTicketsList";

export default function MyTicketsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Tickets</h1>

      </div>

      <MyTicketsList />
    </main>
  );
}