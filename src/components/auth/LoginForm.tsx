"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchProfileApproval,
  PENDING_APPROVAL_MESSAGE,
  PROFILE_LOAD_ERROR_MESSAGE,
} from "@/lib/profile-auth";
import { AuthShell } from "./AuthShell";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pendingFromUrl =
    searchParams.get("error") === "pending" ? PENDING_APPROVAL_MESSAGE : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const userId = signInData.user?.id;
    if (userId) {
      const { isApproved, error: profileError } = await fetchProfileApproval(supabase, userId);

      if (profileError) {
        await supabase.auth.signOut();
        setError(PROFILE_LOAD_ERROR_MESSAGE);
        setLoading(false);
        return;
      }

      if (!isApproved) {
        await supabase.auth.signOut();
        setError(PENDING_APPROVAL_MESSAGE);
        setLoading(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  const displayError = error ?? pendingFromUrl;

  return (
    <AuthShell
      title="Welcome"
      titleAccent="back"
      subtitle="Sign in to access the DAX Formula Library and your saved selections."
    >
      {displayError && (
        <div className={pendingFromUrl && !error ? "auth-info" : "auth-error"}>
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="auth-input"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="auth-input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="auth-footer">
        No account? <Link href="/signup">Create one</Link>
      </p>
    </AuthShell>
  );
}
