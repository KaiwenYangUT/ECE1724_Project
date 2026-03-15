"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { extractTicketTokenFromQrValue } from "@/lib/tickets/qr";

type DashboardResponse = {
  event?: {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    location: string;
    organizer: {
      id: string;
      name: string;
      email: string;
    };
    assignedStaff?: {
      id: string;
      name: string;
      email: string;
      role: string;
    }[];
  };
  stats?: {
    totalSold: number;
    totalCheckedIn: number;
    totalNotCheckedIn: number;
    checkInRate: number;
  };
  tierStats?: {
    id: string;
    name: string;
    price: number;
    quantityLimit: number;
    sold: number;
    checkedIn: number;
    remaining: number;
  }[];
  recentCheckIns?: {
    id: string;
    qrCodeToken: string;
    checkInTime: string | null;
    attendee: {
      id: string;
      name: string;
      email: string;
    };
    ticketTier: {
      id: string;
      name: string;
    };
  }[];
  staffOptions?: {
    id: string;
    name: string;
    email: string;
  }[];
  permissions?: {
    canAssignStaff: boolean;
    canCheckInTickets: boolean;
  };
  error?: string;
};

type CheckInResponse = {
  message?: string;
  error?: string;
  ticket?: {
    id: string;
    qrCodeToken?: string;
    checkInStatus: boolean;
    checkInTime: string | null;
    attendee: {
      id: string;
      name: string;
      email: string;
    };
    ticketTier: {
      id: string;
      name: string;
    };
  };
};

type Html5QrcodeInstance = {
  clear: () => void;
  isScanning: boolean;
  start: (
    cameraIdOrConfig: string | MediaTrackConstraints,
    configuration: {
      fps?: number;
      qrbox?: number;
      aspectRatio?: number;
    },
    qrCodeSuccessCallback: (decodedText: string) => void,
    qrCodeErrorCallback?: (errorMessage: string) => void,
  ) => Promise<null>;
  stop: () => Promise<void>;
};

const PIE_COLORS = ["#16a34a", "#94a3b8"];

export default function EventDashboard({ eventId }: { eventId: string }) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [staffOptions, setStaffOptions] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [assigningStaff, setAssigningStaff] = useState(false);
  const [assignStaffMessage, setAssignStaffMessage] = useState("");
  const [assignStaffError, setAssignStaffError] = useState("");
  const [ticketInput, setTicketInput] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState("");
  const [checkInError, setCheckInError] = useState("");
  const [checkedInTicket, setCheckedInTicket] = useState<CheckInResponse["ticket"] | null>(
    null,
  );
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const scannerRegionId = `ticket-qr-reader-${eventId}`;

  const loadDashboard = useCallback(
    async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        setPageError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setPageError("Please log in first.");
          return;
        }

        const response = await fetch(`/api/events/${eventId}/dashboard`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: DashboardResponse = await response.json();

        if (!response.ok) {
          setPageError(result.error || "Failed to load dashboard.");
          return;
        }

        setData(result);
        setStaffOptions(result.staffOptions || []);
      } catch {
        setPageError("Network error. Please try again.");
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    },
    [eventId],
  );

  const stopScanner = useCallback(async () => {
    const activeScanner = scannerRef.current;

    if (!activeScanner) {
      return;
    }

    try {
      if (activeScanner.isScanning) {
        await activeScanner.stop();
      }
    } catch {
      // Ignore stop errors while shutting the scanner down.
    }

    try {
      activeScanner.clear();
    } catch {
      // Ignore clear errors from a partially initialized scanner.
    }

    scannerRef.current = null;
  }, []);

  useEffect(() => {
    void loadDashboard(true);

    const intervalId = setInterval(() => {
      void loadDashboard(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [eventId, loadDashboard]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  const submitCheckIn = useCallback(
    async (rawValue: string) => {
      setIsCheckingIn(true);
      setCheckInMessage("");
      setCheckInError("");
      setCheckedInTicket(null);

      const token = localStorage.getItem("token");

      if (!token) {
        setCheckInError("Please log in first.");
        setIsCheckingIn(false);
        return false;
      }

      const resolvedQrValue = extractTicketTokenFromQrValue(rawValue);

      if (!resolvedQrValue) {
        setCheckInError("Enter a valid ticket token or scan a valid ticket QR code.");
        setIsCheckingIn(false);
        return false;
      }

      if (resolvedQrValue.eventId && resolvedQrValue.eventId !== eventId) {
        setCheckInError("This QR code belongs to a different event.");
        setIsCheckingIn(false);
        return false;
      }

      try {
        const response = await fetch(`/api/events/${eventId}/dashboard`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            qrCodeToken: resolvedQrValue.token,
          }),
        });

        const result: CheckInResponse = await response.json();

        if (!response.ok) {
          setCheckInError(result.error || "Failed to validate ticket.");
          if (result.ticket) {
            setCheckedInTicket(result.ticket);
          }
          return false;
        }

        setTicketInput("");
        setCheckInMessage(result.message || "Ticket checked in successfully.");
        setCheckedInTicket(result.ticket || null);
        await loadDashboard(false);
        return true;
      } catch {
        setCheckInError("Network error. Please try again.");
        return false;
      } finally {
        setIsCheckingIn(false);
      }
    },
    [eventId, loadDashboard],
  );

  useEffect(() => {
    if (!scannerOpen) {
      void stopScanner();
      setScannerLoading(false);
      return;
    }

    let isActive = true;

    async function startScanner() {
      setScannerError("");
      setScannerLoading(true);

      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

        if (!isActive) {
          return;
        }

        const scanner = new Html5Qrcode(scannerRegionId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          useBarCodeDetectorIfSupported: true,
          verbose: false,
        });

        scannerRef.current = scanner as Html5QrcodeInstance;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 220,
            aspectRatio: 1,
          },
          (decodedText) => {
            if (!isActive) {
              return;
            }

            setTicketInput(decodedText);
            setScannerOpen(false);
            void submitCheckIn(decodedText);
          },
          () => {
            // Ignore repeated scan errors while the camera is searching for a QR code.
          },
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Camera access failed. Check browser permissions and try again.";

        setScannerError(errorMessage);
        setScannerOpen(false);
        await stopScanner();
      } finally {
        if (isActive) {
          setScannerLoading(false);
        }
      }
    }

    void startScanner();

    return () => {
      isActive = false;
      void stopScanner();
    };
  }, [scannerOpen, scannerRegionId, stopScanner, submitCheckIn]);

  async function handleAssignStaff() {
    try {
      setAssigningStaff(true);
      setAssignStaffMessage("");
      setAssignStaffError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setAssignStaffError("Please log in first.");
        return;
      }

      if (!selectedStaffId) {
        setAssignStaffError("Please select a staff member.");
        return;
      }

      const response = await fetch(`/api/events/${eventId}/dashboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedStaffId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setAssignStaffError(result.error || "Failed to assign staff.");
        return;
      }

      setAssignStaffMessage("Staff assigned successfully.");
      setSelectedStaffId("");
      await loadDashboard(false);
    } catch {
      setAssignStaffError("Network error. Please try again.");
    } finally {
      setAssigningStaff(false);
    }
  }

  async function handleManualCheckIn() {
    if (!ticketInput.trim()) {
      setCheckInMessage("");
      setCheckInError("Please enter a ticket token or QR payload.");
      setCheckedInTicket(null);
      return;
    }

    await submitCheckIn(ticketInput);
  }

  const overviewPieData = useMemo(() => {
    if (!data?.stats) return [];

    return [
      { name: "Checked In", value: data.stats.totalCheckedIn },
      { name: "Not Checked In", value: data.stats.totalNotCheckedIn },
    ];
  }, [data]);

  const tierBarData = useMemo(() => {
    return (
      data?.tierStats?.map((tier) => ({
        name: tier.name,
        Sold: tier.sold,
        CheckedIn: tier.checkedIn,
        Remaining: tier.remaining,
      })) || []
    );
  }, [data]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        Loading dashboard...
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

  if (!data?.event || !data?.stats) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        No dashboard data found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">{data.event.title}</h1>
        <p className="mt-2 text-slate-600">{data.event.description}</p>
        <p className="mt-4 text-sm text-slate-700">
          <span className="font-medium">Date:</span>{" "}
          {new Date(data.event.dateTime).toLocaleString()}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">Location:</span> {data.event.location}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">Organizer:</span> {data.event.organizer.name}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">Staff:</span>{" "}
          {data.event.assignedStaff && data.event.assignedStaff.length > 0
            ? data.event.assignedStaff.map((staff) => staff.name).join(", ")
            : "No staff assigned yet"}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Scan Or Validate Ticket</h2>
          <p className="mt-2 text-sm text-slate-600">
            Scan the QR code with your camera or paste the ticket token. Structured QR
            payloads and legacy token-only QR codes are both supported.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                setScannerError("");
                setScannerOpen((currentValue) => !currentValue);
              }}
              disabled={isCheckingIn}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {scannerOpen ? "Stop Scanner" : "Start QR Scanner"}
            </button>

            <button
              onClick={handleManualCheckIn}
              disabled={isCheckingIn}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isCheckingIn ? "Checking..." : "Validate & Check In"}
            </button>
          </div>

          {scannerOpen ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div
                id={scannerRegionId}
                className="mx-auto min-h-72 w-full overflow-hidden rounded-2xl bg-black"
              />
              <p className="mt-3 text-sm text-slate-600">
                Point the rear camera at the attendee&apos;s QR code.
              </p>
              {scannerLoading ? (
                <p className="mt-2 text-sm text-slate-500">Starting camera...</p>
              ) : null}
            </div>
          ) : null}

          {scannerError ? (
            <p className="mt-3 text-sm text-red-600">{scannerError}</p>
          ) : null}

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Manual Token / QR Payload
            </label>
            <input
              type="text"
              value={ticketInput}
              onChange={(event) => setTicketInput(event.target.value)}
              placeholder="Paste ticket token or scanned QR payload"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {checkInMessage ? (
            <p className="mt-3 text-sm text-emerald-600">{checkInMessage}</p>
          ) : null}

          {checkInError ? (
            <p className="mt-3 text-sm text-red-600">{checkInError}</p>
          ) : null}

          {checkedInTicket ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">Attendee:</span>{" "}
                {checkedInTicket.attendee.name} ({checkedInTicket.attendee.email})
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-900">Ticket Tier:</span>{" "}
                {checkedInTicket.ticketTier.name}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-900">Status:</span>{" "}
                {checkedInTicket.checkInStatus ? "Checked In" : "Not Checked In"}
              </p>
              {checkedInTicket.checkInTime ? (
                <p className="mt-1">
                  <span className="font-semibold text-slate-900">Check-in Time:</span>{" "}
                  {new Date(checkedInTicket.checkInTime).toLocaleString()}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Recent Check-ins</h2>
          <p className="mt-2 text-sm text-slate-600">
            Latest validated tickets. This panel refreshes automatically.
          </p>

          <div className="mt-4 space-y-3">
            {data.recentCheckIns && data.recentCheckIns.length > 0 ? (
              data.recentCheckIns.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {ticket.attendee.name}
                  </p>
                  <p className="text-sm text-slate-600">{ticket.attendee.email}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Tier: {ticket.ticketTier.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Token: {ticket.qrCodeToken}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Checked in{" "}
                    {ticket.checkInTime
                      ? new Date(ticket.checkInTime).toLocaleString()
                      : "just now"}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No tickets have been checked in yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {data.permissions?.canAssignStaff ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Assign Staff</h2>
          <p className="mt-2 text-sm text-slate-600">
            Select a staff member and assign them to this event.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              value={selectedStaffId}
              onChange={(event) => setSelectedStaffId(event.target.value)}
            >
              <option value="">Select a staff member</option>
              {staffOptions.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.email})
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignStaff}
              disabled={assigningStaff}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {assigningStaff ? "Assigning..." : "Assign Staff"}
            </button>
          </div>

          {assignStaffMessage ? (
            <p className="mt-3 text-sm text-green-600">{assignStaffMessage}</p>
          ) : null}

          {assignStaffError ? (
            <p className="mt-3 text-sm text-red-600">{assignStaffError}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Tickets Sold</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.stats.totalSold}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Checked In</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.stats.totalCheckedIn}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Not Checked In</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.stats.totalNotCheckedIn}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Check-in Percentage</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {data.stats.checkInRate}%
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">
          Ticket Tier Statistics
        </h2>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-3">Tier</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Capacity</th>
                <th className="px-3 py-3">Sold</th>
                <th className="px-3 py-3">Checked In</th>
                <th className="px-3 py-3">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {data.tierStats?.map((tier) => (
                <tr key={tier.id} className="border-b last:border-b-0">
                  <td className="px-3 py-3">{tier.name}</td>
                  <td className="px-3 py-3">${tier.price.toFixed(2)}</td>
                  <td className="px-3 py-3">{tier.quantityLimit}</td>
                  <td className="px-3 py-3">{tier.sold}</td>
                  <td className="px-3 py-3">{tier.checkedIn}</td>
                  <td className="px-3 py-3">{tier.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Check-in Overview</h2>
          <p className="mt-2 text-sm text-slate-600">
            Overall checked-in versus not checked-in tickets.
          </p>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overviewPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {overviewPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Tier Capacity Summary</h2>
          <p className="mt-2 text-sm text-slate-600">
            Compare sold, checked-in, and remaining tickets by tier.
          </p>

          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Sold" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="CheckedIn" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Remaining" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
