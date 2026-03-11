import CreateEventForm from "@/components/CreateEventForm";
export default function CreateEventPage() {
  return (
    // Main page container for the event creation feature
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Create Event</h1>
      <CreateEventForm />
      </div>
    </main>
    
  );
}
