import EventList from "@/components/EventList";

export default function CreateTicketPage() {
  return (
    // Main page container for ticket purchase / registration
    <main className=
    "mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Purchase Ticket</h1>
      <EventList />
    </main>
  );
}
