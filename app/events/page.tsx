import EventList from "@/components/EventList";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <h1 className="mb-6 text-center text-2xl font-semibold">Events</h1>
      <EventList />
    </main>
  );
}