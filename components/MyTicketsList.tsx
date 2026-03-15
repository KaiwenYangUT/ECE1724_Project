"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type TicketItem = {
  id: string;
  qrCodeToken: string;
  qrCodeDataUrl: string | null;
  checkInStatus: boolean;
  checkInTime: string | null;
  createdAt: string;
  isExpired: boolean;
  displayStatus: "Valid" | "Checked In" | "Expired" | string;
  event: {
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
  };
  ticketTier: {
    id: string;
    name: string;
    price: number;
    quantityLimit: number;
  };
};

type MyTicketsResponse = {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tickets?: TicketItem[];
  error?: string;
};

function getStatusClasses(status: string) {
  if (status === "Checked In") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Expired") {
    return "bg-red-200 text-red-700";
  }

  return "bg-blue-100 text-blue-700";
}

export default function MyTicketsList() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [activeHighlightId, setActiveHighlightId] = useState("");
  const [downloadingTicketId, setDownloadingTicketId] = useState("");
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    async function loadMyTickets() {
      try {
        setLoading(true);
        setPageError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setPageError("Please log in first to view your tickets.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/users/me/tickets", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: MyTicketsResponse = await response.json();

        if (!response.ok) {
          setPageError(data.error || "Failed to load your tickets.");
          setLoading(false);
          return;
        }

        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
        setUserName(data.user?.name || "");
      } catch {
        setPageError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadMyTickets();
  }, []);

  useEffect(() => {
    if (!highlightId || tickets.length === 0) {
      return;
    }

    const element = document.getElementById(`ticket-${highlightId}`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setActiveHighlightId(highlightId);

      const timer = setTimeout(() => {
        setActiveHighlightId("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [highlightId, tickets]);

  async function handleDownloadPdf(ticketId: string, eventTitle: string) {
    try {
      setDownloadingTicketId(ticketId);
      setDownloadError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setDownloadError("Please log in first to download your ticket PDF.");
        return;
      }

      const response = await fetch(`/api/tickets/${ticketId}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setDownloadError(data?.error || "Failed to download the ticket PDF.");
        return;
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeEventTitle = eventTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      link.href = blobUrl;
      link.download = `${safeEventTitle || "ticket"}-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setDownloadError("Network error. Please try again.");
    } finally {
      setDownloadingTicketId("");
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        Loading your tickets...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-700">
        {pageError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          {userName ? `${userName}'s Tickets` : "My Ticket Collection"}
        </h2>
        <p className="mt-2 text-slate-600">
          Purchased tickets, event information, QR codes, and current ticket status.
        </p>
        {downloadError ? (
          <p className="mt-3 text-sm text-red-600">{downloadError}</p>
        ) : null}
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-slate-200">
          You have not purchased any tickets yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <div
              id={`ticket-${ticket.id}`}
              key={ticket.id}
              className={`overflow-hidden rounded-3xl shadow-sm ring-1 transition-all duration-500 ${
                activeHighlightId === ticket.id
                  ? "bg-blue-200 ring-blue-600"
                  : "bg-white ring-slate-200"
              }`}
            >
              <div className="grid gap-0 lg:grid-cols-[1.5fr_0.9fr]">
                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {ticket.event.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                        ticket.displayStatus
                      )}`}
                    >
                      {ticket.displayStatus}
                    </span>
                  </div>

                  <p className="mb-4 text-slate-600">{ticket.event.description}</p>

                  <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <div>
                      <span className="font-semibold text-slate-900">Date:</span>{" "}
                      {new Date(ticket.event.dateTime).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Location:</span>{" "}
                      {ticket.event.location}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Organizer:</span>{" "}
                      {ticket.event.organizer.name}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Ticket Tier:</span>{" "}
                      {ticket.ticketTier.name}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Price:</span> $
                      {ticket.ticketTier.price.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">Purchased:</span>{" "}
                      {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {ticket.checkInStatus && ticket.checkInTime ? (
                    <div className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      Checked in at {new Date(ticket.checkInTime).toLocaleString()}.
                    </div>
                  ) : null}

                  {!ticket.checkInStatus && ticket.isExpired ? (
                    <div className="mt-5 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
                      This ticket is expired.
                    </div>
                  ) : null}

                  {!ticket.checkInStatus && !ticket.isExpired ? (
                    <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                      This ticket is valid for check-in.
                    </div>
                  ) : null}

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(ticket.id, ticket.event.title)}
                      disabled={downloadingTicketId === ticket.id}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      {downloadingTicketId === ticket.id
                        ? "Preparing PDF..."
                        : "Download PDF Ticket"}
                    </button>
                  </div>
                </div>

                <div className="border-t bg-slate-50 p-6 lg:border-l lg:border-t-0">
                  <h4 className="mb-4 text-lg font-semibold text-slate-900">
                    Ticket QR Code
                  </h4>

                  {ticket.qrCodeDataUrl ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={ticket.qrCodeDataUrl}
                        alt={`${ticket.event.title} QR code`}
                        className="h-56 w-56 rounded-2xl border bg-white p-2"
                      />
                      <p className="mt-4 break-all text-center text-xs text-slate-500">
                        Token: {ticket.qrCodeToken}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                      QR code is not available for this ticket.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
