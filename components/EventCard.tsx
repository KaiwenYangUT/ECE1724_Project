// One event’s UI + purchase action
// handles one event
// lets user purchase that event’s ticket

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

export default function EventCard({event, currentUser, onPurchased, onDeleted}: EventCardProps) {
  const router = useRouter();
  //which ticket tier the user selects
  const [selectedTierId, setSelectedTierId] = useState(
    event.ticketTiers[0]?.id ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canDelete = currentUser?.role === "ORGANIZER" && currentUser?.id === event.organizer.id;

  async function handleDelete() {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Please log in first.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

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
    setSuccessMessage("");
    setErrorMessage("");
    setQrCodeDataUrl("");

    // get saved login token from browser storage
    const token = localStorage.getItem("token");

    // user must be logged in before purchasing
    if (!token) {
      setLoading(false);
      setErrorMessage("Please log in before purchasing a ticket.");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      return;
    }
    // user must select a tier before purchasing
    if (!selectedTierId) {
      setLoading(false);
      setErrorMessage("Please select a ticket tier.");
      return;
    }

    try {
      // send purchase request to backend
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

      setSuccessMessage("Ticket purchased successfully.");
      setQrCodeDataUrl(data?.ticket?.qrCodeDataUrl || "");
      await onPurchased();
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // display
  return (
    <div 
    className="rounded-2xl border p-5 shadow-sm">
 
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{event.title}</h2>
          <p className="text-sm text-gray-600">{event.description}</p>
          <p className="text-sm">
            <span className="font-medium">Date:</span> {new Date(event.dateTime).toLocaleString()}
          </p>
          <p className="text-sm">
            <span className="font-medium">Location:</span> {event.location}
          </p>
          <p className="text-sm">
            <span className="font-medium">Organizer:</span> {event.organizer.name}
          </p>
        </div>

        {canDelete ? (
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="ml-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {deleteLoading ? "Deleting..." : "Delete Event"}
          </button>
        ) : null}
      </div>      

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium">Select Ticket Tier</label>
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

      {successMessage ? (
        <div className="mt-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <button
        onClick={handlePurchase}
        disabled={loading || event.ticketTiers.length === 0}
        className="mt-4 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Processing..." : "Purchase"}
      </button>

      {qrCodeDataUrl ? (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">Generated QR Code</p>
          <img
            src={qrCodeDataUrl}
            alt="Ticket QR code"
            className="h-48 w-48 rounded-lg border"
          />
        </div>
      ) : null}
    </div>
  );
}