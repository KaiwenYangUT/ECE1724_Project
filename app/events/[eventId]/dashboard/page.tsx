import EventDashboard from "@/components/EventDashboard";

type PageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventDashboardPage({ params }: PageProps) {
  const { eventId } = await params;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <EventDashboard eventId={eventId} />
    </main>
  );
}