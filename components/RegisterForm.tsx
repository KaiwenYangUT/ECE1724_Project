"use client";

import * as React from "react";
import { useState } from "react";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("");
  }

  async function handleRegister(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.error) {
          setErrorMessage(data.error);
        } else {
          setErrorMessage("Failed to register!");
        }
        return;
      }

      setSuccessMessage(
        "User registered successfully. Returning to the main page in 3 seconds..."
      );
      resetForm();

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 3000);
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (successMessage) {
    return (

      <div className="rounded-2xl border border-green-300 bg-green-50 p-6 shadow-sm">
        <div className="mt-4 rounded-xl border border-green-300 bg-white px-5 py-4 text-base font-semibold text-green-800">
          {successMessage}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleRegister}
      className="space-y-5 rounded-2xl border p-6 shadow-sm"
    >
      <h1 className="text-2xl font-semibold">Register</h1>

      {errorMessage ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          type="text"
          className="w-full rounded-lg border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full rounded-lg border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Role</label>
        <select
          className="w-full rounded-lg border px-3 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole | "")}
          required
        >
          <option value="">Select a role</option>
          <option value="ATTENDEE">Attendee</option>
          <option value="STAFF">Staff</option>
          <option value="ORGANIZER">Organizer</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}