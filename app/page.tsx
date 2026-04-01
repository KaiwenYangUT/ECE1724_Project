"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UserRole = "ATTENDEE" | "STAFF" | "ORGANIZER" | "";
type SessionState = {
  isLoggedIn: boolean;
  userName: string;
  userRole: UserRole;
};

const SESSION_EVENT = "session-change";
const LOGGED_OUT_SNAPSHOT = JSON.stringify({
  isLoggedIn: false,
  userName: "",
  userRole: "",
} satisfies SessionState);

function getClientSessionSnapshot() {
  const token = localStorage.getItem("token");
  return JSON.stringify({
    isLoggedIn: Boolean(token),
    userName: localStorage.getItem("userName") || "",
    userRole: (localStorage.getItem("userRole") || "") as UserRole,
  } satisfies SessionState);
}

function subscribeToSession(callback: () => void) {
  const handleStorage = () => callback();
  window.addEventListener("storage", handleStorage);
  window.addEventListener(SESSION_EVENT, handleStorage);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SESSION_EVENT, handleStorage);
  };
}

type FeatureCardProps = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  accentClasses: string;
  icon: React.ReactNode;
};

function FeatureCard({
  href,
  eyebrow,
  title,
  description,
  accentClasses,
  icon,
}: FeatureCardProps) {
  return (
    <Link href={href} className="block h-full">
      <Card className="group flex h-full flex-row items-center gap-5 border-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
        <CardContent className="flex w-full items-center gap-5 p-6">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${accentClasses}`}
          >
            {icon}
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {eyebrow}
            </p>
            <CardTitle className="mt-1 text-2xl text-slate-900">{title}</CardTitle>
            <CardDescription className="mt-2 text-base leading-7 text-slate-600">
              {description}
            </CardDescription>
            <div className="mt-4 text-sm font-semibold text-slate-900">
              Open page <span className="transition group-hover:ml-1">→</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function HomePage() {
  const sessionSnapshot = useSyncExternalStore(
    subscribeToSession,
    getClientSessionSnapshot,
    () => LOGGED_OUT_SNAPSHOT
  );
  const session = JSON.parse(sessionSnapshot) as SessionState;
  const { isLoggedIn, userName, userRole } = session;

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.dispatchEvent(new Event(SESSION_EVENT));
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <Card className="mb-12 rounded-3xl border-slate-200 shadow-lg shadow-slate-200/60">
          <CardHeader className="max-w-3xl p-8">
            <Badge className="mb-3 w-fit bg-sky-100 text-sky-800 hover:bg-sky-100">
              ECE1724 Project
            </Badge>
            <CardTitle className="text-4xl tracking-tight text-slate-900 md:text-5xl">
              Ticketa
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-600">
              Browse campus events, register accounts, purchase tickets, and manage
              operations from one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-0">
            <div className="flex flex-wrap items-center gap-4">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login/create"
                    className={cn(
                      buttonVariants({ size: "default" }),
                      "rounded-xl bg-emerald-500 hover:bg-emerald-600"
                    )}
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    )}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Badge className="rounded-xl bg-sky-100 px-4 py-3 text-base font-semibold text-sky-800 hover:bg-sky-100">
                    Hello, {userName || "User"}!
                  </Badge>

                  <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="rounded-xl bg-slate-200 text-slate-900 hover:bg-slate-300"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
            href="/events"
            eyebrow="Event Access"
            title="Browse Events"
            description="View available events and ticket tiers."
            accentClasses="bg-violet-100 text-violet-600"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-8 w-8"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v3h18V6a2 2 0 0 0-2-2Z" />
                <path d="M3 11v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7H3Zm5 2h3v3H8v-3Z" />
              </svg>
            }
          />
          
          {!isLoggedIn && (
            <Card className="overflow-hidden rounded-3xl border-slate-200 sm:col-span-2 xl:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Discover upcoming experiences</CardTitle>
                <CardDescription>
                  Sign in or register to purchase tickets and keep your passes in one place.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
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
              </CardContent>
            </Card>
          )}

          {isLoggedIn && (
            <FeatureCard
              href="/my-tickets"
              eyebrow="Personal Access"
              title="My Tickets"
              description="See your registered events and QR codes."
              accentClasses="bg-cyan-100 text-cyan-600"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-8 w-8"
                >
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a1 1 0 0 0 0 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a1 1 0 0 0 0-2V7Zm5 1a1 1 0 0 0-2 0v8a1 1 0 1 0 2 0V8Zm8 0H11v2h6V8Zm0 4H11v2h6v-2Z" />
                </svg>
              }
            />
          )}

          {isLoggedIn && userRole === "ORGANIZER" && (
            <FeatureCard
              href="/events/create"
              eyebrow="Organizer Access"
              title="Create Event"
              description="Create a new event and set ticket tiers."
              accentClasses="bg-orange-100 text-orange-600"
              icon={
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
              }
            />
          )}
        </div>
      </section>
    </main>
  );
}
