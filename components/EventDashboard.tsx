"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  error?: string;
};

const PIE_COLORS = ["#16a34a", "#94a3b8"];

export default function EventDashboard({ eventId }: { eventId: string }) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function loadDashboard(isInitialLoad = false) {
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
      } catch {
        setPageError("Network error. Please try again.");
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    }

    void loadDashboard(true);

    intervalId = setInterval(() => {
      void loadDashboard(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [eventId]);

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
        <h1 className="text-3xl font-bold text-slate-900">
          {data.event.title}
        </h1>
        <p className="mt-2 text-slate-600">{data.event.description}</p>
        <p className="mt-4 text-sm text-slate-700">
          <span className="font-medium">Date:</span>{" "}
          {new Date(data.event.dateTime).toLocaleString()}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">Location:</span> {data.event.location}
        </p>
        <p className="text-sm text-slate-700">
          <span className="font-medium">Organizer:</span>{" "}
          {data.event.organizer.name}
        </p>
      </div>

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
          <h2 className="text-xl font-semibold text-slate-900">
            Check-in Overview
          </h2>
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
          <h2 className="text-xl font-semibold text-slate-900">
            Tier Capacity Summary
          </h2>
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