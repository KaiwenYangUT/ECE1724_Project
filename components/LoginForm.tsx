"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  message?: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  error?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: {
      email?: string[];
      password?: string[];
    };
  };
};

export default function LoginForm() {
  const router = useRouter();

  // form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // optional field-level errors from zod response
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    // start fresh every time user submits
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setEmailError("");
    setPasswordError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data: LoginResponse = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || "Login failed.");

        // show field-specific validation messages if backend sends them
        if (data.details?.fieldErrors?.email?.[0]) {
          setEmailError(data.details.fieldErrors.email[0]);
        }

        if (data.details?.fieldErrors?.password?.[0]) {
          setPasswordError(data.details.fieldErrors.password[0]);
        }

        return;
      }

      // save login result for later authenticated requests
      // ticket purchase and event creation can read this token from localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // save basic user info too
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      setSuccessMessage(data.message || "Login successful.");

      // redirect after successful login
      //"/" or "/my-tickets"??
      router.push("/my-tickets");
      router.refresh();
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border p-6 shadow-sm"
    >
      <h1 className="text-2xl font-semibold">Login</h1>

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

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError ? (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {passwordError ? (
          <p className="mt-1 text-sm text-red-600">{passwordError}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}