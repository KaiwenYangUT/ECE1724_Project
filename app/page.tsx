"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserRole = "ATTENDEE" | "STAFF" | "ORGANIZER" | "";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName") || "";
    const storedRole = (localStorage.getItem("userRole") || "") as UserRole;

    if (token) {
      setIsLoggedIn(true);
      setUserName(storedName);
      setUserRole(storedRole);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    setIsLoggedIn(false);
    setUserName("");
    setUserRole("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-12 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="max-w-3xl">
            <p className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-700">
              ECE1724 Project
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Event Ticketing System
            </h1>

            <div className="mt-8 flex flex-wrap gap-4">
              

              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login/create"
                    className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <div className="rounded-xl bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-800">
                    Hello, {userName || "User"}!
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-xl bg-slate-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            href="/events"
            className="group flex items-center gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v3h18V6a2 2 0 0 0-2-2Z" />
                <path d="M3 11v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7H3Zm5 2h3v3H8v-3Z" />
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
                Event Access
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Browse Events</h2>
              <p className="mt-2 leading-7 text-slate-600">
                View available events & ticket tiers.
              </p>
              <div className="mt-4 text-sm font-semibold text-violet-600">
                Open page <span className="transition group-hover:ml-1">→</span>
              </div>
            </div>
          </Link>
          
          {!isLoggedIn && (
            <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:col-span-2 xl:col-span-2">
              <div className="mb-5">
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
                    alt="People enjoying a concert event"
                    className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl md:translate-y-6">
                  <img
                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
                    alt="Happy crowd at an event"
                    className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80"
                    alt="Festival lights and audience"
                    className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl md:translate-y-6">
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
                    alt="Friends celebrating at an event"
                    className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <Link
              href="/my-tickets"
              className="group flex items-center gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-8 w-8"
                >
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a1 1 0 0 0 0 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a1 1 0 0 0 0-2V7Zm5 1a1 1 0 0 0-2 0v8a1 1 0 1 0 2 0V8Zm8 0H11v2h6V8Zm0 4H11v2h6v-2Z" />
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-cyan-600">
                  Personal Access
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">My Tickets</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  See your registered events and QR codes.
                </p>
                <div className="mt-4 text-sm font-semibold text-cyan-600">
                  Open page <span className="transition group-hover:ml-1">→</span>
                </div>
              </div>
            </Link>
          )}

          {isLoggedIn && userRole === "ORGANIZER" && (
            <Link
              href="/events/create"
              className="group flex items-center gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-8 w-8"
                >
                  <path d="M6 3.75A1.75 1.75 0 0 0 4.25 5.5v13A1.75 1.75 0 0 0 6 20.25h8.25a.75.75 0 0 0 0-1.5H6a.25.25 0 0 1-.25-.25v-13A.25.25 0 0 1 6 5.25h8a.75.75 0 0 0 0-1.5H6Z" />
                  <path d="M14.56 4.97a1.75 1.75 0 0 1 2.475 0l1.995 1.995a1.75 1.75 0 0 1 0 2.475l-6.9 6.9a2.25 2.25 0 0 1-1.02.57l-2.295.574a.75.75 0 0 1-.91-.91l.574-2.295a2.25 2.25 0 0 1 .57-1.02l6.9-6.9Z" />
                  <path d="M9.75 7.5a.75.75 0 0 1 .75-.75h1.75a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75Zm0 3.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75Z" />
                </svg>
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                  Organizer Access
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Create Event</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  Create a new event and set ticket tiers.
                </p>
                <div className="mt-4 text-sm font-semibold text-orange-600">
                  Open page <span className="transition group-hover:ml-1">→</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}