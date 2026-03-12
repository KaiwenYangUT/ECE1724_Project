"use client";

import * as React from "react";
import { useState } from "react";

type TicketTierInput = {
  name: string;
  price: string;
  quantityLimit: string;
};

const emptyTier = (): TicketTierInput => ({
  name: "",
  price: "",
  quantityLimit: "",
});

export default function CreateEventForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [ticketTiers, setTicketTiers] = useState<TicketTierInput[]>([emptyTier()]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateTier(index: number, field: keyof TicketTierInput, value: string) {
    setTicketTiers((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)),
    );
  }

  function addTier() {
    setTicketTiers((prev) => [...prev, emptyTier()]);
  }

  function removeTier(index: number) {
    setTicketTiers((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setDateTime("");
    setLocation("");
    setBannerImageUrl("");
    setTicketTiers([emptyTier()]);
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      setErrorMessage("Please log in as an organizer first.");
      return;
    }

    try {
      //Try to create an event based on user input
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          dateTime,
          location,
          bannerImageUrl,
          ticketTiers: ticketTiers.map((tier) => ({
            name: tier.name,
            price: Number(tier.price),
            quantityLimit: Number(tier.quantityLimit),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.error) {
          setErrorMessage(data.error);
        } else {
          setErrorMessage("Failed to create event.");
        }
        return;
      }

      setSuccessMessage("Event created successfully.");
      resetForm();
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border p-6 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          className="w-full rounded-lg border px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description"
          rows={4}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Date and Time</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Location</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Event location"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Banner Image URL</label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={bannerImageUrl}
          onChange={(e) => setBannerImageUrl(e.target.value)}
          placeholder="Optional image URL"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Ticket Tiers</h2>
          <button
            type="button"
            onClick={addTier}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Add Tier
          </button>
        </div>

        {ticketTiers.map((tier, index) => (
          <div key={index} className="space-y-3 rounded-xl border p-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tier Name</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={tier.name}
                onChange={(e) => updateTier(index, "name", e.target.value)}
                placeholder="General / VIP / Early Bird"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Price</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="number"
                min="0"
                step="0.01"
                value={tier.price}
                onChange={(e) => updateTier(index, "price", e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Quantity Limit</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                type="number"
                min="1"
                step="1"
                value={tier.quantityLimit}
                onChange={(e) => updateTier(index, "quantityLimit", e.target.value)}
                placeholder="50"
              />
            </div>

            <button
              type="button"
              onClick={() => removeTier(index)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Remove Tier
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Event"}
      </button>
      
     {successMessage ? (
        <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}
    </form>
    
  );
}