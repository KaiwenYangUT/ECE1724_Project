"use client";

import * as React from "react";
import { useState } from "react";
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
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);
      }

      setSuccessMessage(data.message || "Login successful.");

      // redirect after successful login
      //"/" or "/my-tickets"??
      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-200/80 shadow-lg shadow-slate-200/40">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Sign in to purchase tickets, manage events, or view your QR passes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {successMessage ? (
            <Alert className="border-green-200 bg-green-50 text-green-900">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          ) : null}

          {errorMessage ? (
            <Alert className="border-red-200 bg-red-50 text-red-900">
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              aria-invalid={Boolean(emailError)}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              aria-invalid={Boolean(passwordError)}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError ? (
              <p className="text-sm text-red-600">{passwordError}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
