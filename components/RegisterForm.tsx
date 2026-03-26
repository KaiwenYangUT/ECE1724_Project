"use client";

import * as React from "react";
import { useState } from "react";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <Card className="border-green-200 bg-green-50 shadow-lg shadow-green-100/60">
        <CardHeader>
          <CardTitle className="text-green-900">Registration complete</CardTitle>
          <CardDescription className="text-green-800">
            Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-white text-green-900">
            <AlertTitle>Redirecting</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200/80 shadow-lg shadow-slate-200/40">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          Create an attendee, staff, or organizer account for the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-5">
          {errorMessage ? (
            <Alert className="border-red-200 bg-red-50 text-red-900">
              <AlertTitle>Registration failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              aria-invalid={Boolean(nameError)}
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
            {nameError ? <p className="text-sm text-red-600">{nameError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              aria-invalid={Boolean(emailError)}
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
            {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
            <p className="text-sm text-slate-500">
              Use a valid email address. This will be your login ID.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              aria-invalid={Boolean(passwordError)}
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
              <p className="text-sm text-red-600">{passwordError}</p>
            ) : null}
            <p className="text-sm text-slate-500">
              Password must be at least 6 characters long.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-slate-300 focus-visible:ring-[3px] focus-visible:ring-sky-100"
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
            {roleError ? <p className="text-sm text-red-600">{roleError}</p> : null}
            <p className="text-sm text-slate-500">
              Choose `Organizer` to create and manage events, `Staff` to help run
              assigned events, or `Attendee` to browse and purchase tickets.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
