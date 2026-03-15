"use client";

import * as React from "react";
import { useState } from "react";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";

type RegisterResponse = {
  message?: string;
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
      name?: string[];
      email?: string[];
      password?: string[];
      role?: string[];
    };
  };
};

function validateName(value: string) {
  return value.trim() ? "" : "Name is required.";
}

function validateEmail(value: string) {
  if (!value.trim()) {
    return "Email is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value.trim()) ? "" : "Enter a valid email address.";
}

function validatePassword(value: string) {
  if (!value) {
    return "Password is required.";
  }

  return value.length >= 6 ? "" : "Password must be at least 6 characters.";
}

function validateRole(value: UserRole | "") {
  return value ? "" : "Please select a role.";
}

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const router = useRouter();

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("");
  }

  function validateAllFields() {
    const nextNameError = validateName(name);
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    const nextRoleError = validateRole(role);

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setRoleError(nextRoleError);

    return !nextNameError && !nextEmailError && !nextPasswordError && !nextRoleError;
  }

  function clearFormErrorIfResolved(nextErrors: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }) {
    const hasAnyError =
      Boolean(nextErrors.name) ||
      Boolean(nextErrors.email) ||
      Boolean(nextErrors.password) ||
      Boolean(nextErrors.role);

    if (!hasAnyError && errorMessage === "Please fix the highlighted fields.") {
      setErrorMessage("");
    }
  }

  async function handleRegister(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setRoleError("");

    if (!validateAllFields()) {
      setErrorMessage("Please fix the highlighted fields.");
      setLoading(false);
      return;
    }

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

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to register.");

        if (data.details?.fieldErrors?.name?.[0]) {
          setNameError(data.details.fieldErrors.name[0]);
        }

        if (data.details?.fieldErrors?.email?.[0]) {
          setEmailError(data.details.fieldErrors.email[0]);
        }

        if (data.details?.fieldErrors?.password?.[0]) {
          setPasswordError(data.details.fieldErrors.password[0]);
        }

        if (data.details?.fieldErrors?.role?.[0]) {
          setRoleError(data.details.fieldErrors.role[0]);
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
          onChange={(e) => {
            const nextValue = e.target.value;
            const nextNameError = validateName(nextValue);
            setName(nextValue);
            setNameError(nextNameError);
            clearFormErrorIfResolved({
              name: nextNameError,
              email: emailError,
              password: passwordError,
              role: roleError,
            });
          }}
          placeholder="Enter your name"
        />
        {nameError ? (
          <p className="mt-1 text-sm text-red-600">{nameError}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full rounded-lg border px-3 py-2"
          value={email}
          onChange={(e) => {
            const nextValue = e.target.value;
            const nextEmailError = validateEmail(nextValue);
            setEmail(nextValue);
            setEmailError(nextEmailError);
            clearFormErrorIfResolved({
              name: nameError,
              email: nextEmailError,
              password: passwordError,
              role: roleError,
            });
          }}
          placeholder="Enter your email"
        />
        {emailError ? (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        ) : null}
        <p className="mt-1 text-sm text-slate-500">
          Use a valid email address. This will be your login ID.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full rounded-lg border px-3 py-2"
          value={password}
          onChange={(e) => {
            const nextValue = e.target.value;
            const nextPasswordError = validatePassword(nextValue);
            setPassword(nextValue);
            setPasswordError(nextPasswordError);
            clearFormErrorIfResolved({
              name: nameError,
              email: emailError,
              password: nextPasswordError,
              role: roleError,
            });
          }}
          placeholder="Enter your password"
        />
        {passwordError ? (
          <p className="mt-1 text-sm text-red-600">{passwordError}</p>
        ) : null}
        <p className="mt-1 text-sm text-slate-500">
          Password must be at least 6 characters long.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Role</label>
        <select
          className="w-full rounded-lg border px-3 py-2"
          value={role}
          onChange={(e) => {
            const nextValue = e.target.value as UserRole | "";
            const nextRoleError = validateRole(nextValue);
            setRole(nextValue);
            setRoleError(nextRoleError);
            clearFormErrorIfResolved({
              name: nameError,
              email: emailError,
              password: passwordError,
              role: nextRoleError,
            });
          }}
        >
          <option value="">Select a role</option>
          <option value="ATTENDEE">Attendee</option>
          <option value="STAFF">Staff</option>
          <option value="ORGANIZER">Organizer</option>
        </select>
        {roleError ? (
          <p className="mt-1 text-sm text-red-600">{roleError}</p>
        ) : null}
        <p className="mt-1 text-sm text-slate-500">
          Choose `Organizer` to create and manage events, `Staff` to help run assigned
          events, or `Attendee` to browse and purchase tickets.
        </p>
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
