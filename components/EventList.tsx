//list page logic & gets all events
//creates many EventCards

"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";


export type EventItem = {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  bannerImageUrl?: string | null;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  ticketTiers: {
    id: string;
    name: string;
    price: number;
    quantityLimit: number;
    soldCount: number;
    remaining: number;
  }[];
  assignedStaff?: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
};

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function EventList() {
  // store all events returned from the backend
  const [events, setEvents] = useState<EventItem[]>([]);
   // controls the loading state (fetching event data)
  const [loading, setLoading] = useState(true);

  const [pageError, setPageError] = useState("");

  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);


  async function loadEvents() {
    try {
      setLoading(true);
      setPageError("");
      // request all available events from the API
      const response = await fetch("/api/events");
      const data = await response.json();

      if (!response.ok) {
        setPageError(data?.error || "Failed to load events.");
        return;
      }

      // save fetched events into state
      setEvents(Array.isArray(data?.events) ? data.events : []);
    } catch {
      setPageError("Network error while loading events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {
        setCurrentUser(null);
      }
    }
    void loadEvents();
  }, []);

  if (loading) {
    return <div className="rounded-xl border p-4">Loading events...</div>;}

  if (pageError) {
    return <div className="rounded-xl border border-red-300 bg-red-50 p-4">{pageError}</div>;
  }

  if (events.length === 0) {
    return <div className="rounded-xl border p-4">No events available yet.</div>;
  }

  return (
    <div className="space-y-5">
      {events.map((event) => (
        <EventCard
        key={event.id}
        event={event}
        currentUser={currentUser}
        onPurchased={loadEvents}
        onDeleted={loadEvents} />
      ))}
    </div>
  );

}
