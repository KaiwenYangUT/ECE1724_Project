"use client";

import * as React from "react";
import { useState } from "react";
import type { EventItem } from "@/components/EventList";
import { useRouter } from "next/navigation";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type EventCardProps = {
  event: EventItem;
  currentUser: StoredUser | null;
  onPurchased: () => void | Promise<void>;
  onDeleted: () => void | Promise<void>;
};

export default function EventCard({
  event,
  currentUser,
  onPurchased,
  onDeleted,
}: EventCardProps) {
  const router = useRouter();

  const [selectedTierId, setSelectedTierId] = useState(
    event.ticketTiers[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const canDelete =
    currentUser?.role === "ORGANIZER" && currentUser?.id === event.organizer.id;

  const canManage = 
    (currentUser?.role === "ORGANIZER" && currentUser?.id === event.organizer.id || currentUser?.role === "STAFF" && event.assignedStaff?.some((staff) => staff.id === currentUser.id));

  async function handleDelete() {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);
      setErrorMessage("");

      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || "Failed to delete event.");
        return;
      }

      await onDeleted();
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleManageEvent(){
      router.push(`/events/${event.id}/dashboard`)
    }

  async function handlePurchase() {
    setLoading(true);
    setErrorMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      setErrorMessage("Please log in before purchasing a ticket.");
      setTimeout(() => {
        router.push("/");
      }, 2000);
      return;
    }

    if (!selectedTierId) {
      setLoading(false);
      setErrorMessage("Please select a ticket tier.");
      return;
    }

    try {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          ticketTierId: selectedTierId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || "Failed to purchase ticket.");
        return;
      }

      const newTicketId = data?.ticket?.id;

      setShowSuccessPopup(true);
      setLoading(false);

      setTimeout(() => {
        if (newTicketId) {
          router.push(`/my-tickets?highlight=${newTicketId}`);
        } else {
          router.push("/my-tickets");
        }
      }, 2000);
    } catch {
      setErrorMessage("Network error. Please try again.");
      setLoading(false);
    }

    
  }

  return (
    <>
      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-[90%] max-w-md rounded-2xl border border-green-300 bg-white px-6 py-8 text-center shadow-xl">
            <h3 className="text-xl font-semibold text-green-700">
              Ticket purchased successfully
            </h3>
            <p className="mt-2 text-sm text-green-600">
              Going to My Tickets...
            </p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto my-6 w-full max-w-4xl rounded-2xl border bg-white p-6 shadow-sm">
        {event.bannerImageUrl ? (
          <img
            src={event.bannerImageUrl}
            alt={`${event.title} banner`}
            className="mb-4 h-56 w-full rounded-xl object-cover"
          />
        ) : null}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-sm text-gray-600">{event.description}</p>
            <p className="text-sm">
              <span className="font-medium">Date:</span>{" "}
              {new Date(event.dateTime).toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Location:</span> {event.location}
            </p>
            <p className="text-sm">
              <span className="font-medium">Organizer:</span>{" "}
              {event.organizer.name}
            </p>
          </div>
         {canDelete ? (
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="shrink-0 rounded-lg bg-red-600 p-3 text-white transition hover:bg-red-700 disabled:opacity-50"
              aria-label="Delete event"
              title="Delete event"
            >
              {deleteLoading ? (
                <span className="text-sm font-medium">...</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              )}
            </button>
          ) : null}
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium">
            Select Ticket Tier
          </label>
          <select
            className="w-full rounded-lg border px-3 py-2"
            value={selectedTierId}
            onChange={(e) => setSelectedTierId(e.target.value)}
          >
            {event.ticketTiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name} - ${tier.price.toFixed(2)} - {tier.remaining} remaining
              </option>
            ))}
          </select>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        
        <div className="mt-4 flex item-center justify-between">
          <button
          onClick={handlePurchase}
          disabled={loading || event.ticketTiers.length === 0 || showSuccessPopup}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-600 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Purchase"}
        </button>
          {canManage ? (
            <button
              onClick={handleManageEvent}
              className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
            >
              Manage
            </button>
            ) : null}
          </div>
      </div>
    </>
  );
}