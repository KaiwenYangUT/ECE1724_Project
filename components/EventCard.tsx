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
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {deleteLoading ? "Deleting..." : "Delete Event"}
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

        <button
          onClick={handlePurchase}
          disabled={loading || event.ticketTiers.length === 0 || showSuccessPopup}
          className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : "Purchase"}
        </button>
      </div>
    </>
  );
}