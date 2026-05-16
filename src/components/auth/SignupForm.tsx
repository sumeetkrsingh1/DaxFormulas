"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureProfileForUser, profileInputFromUser } from "@/lib/ensure-profile";
import { fetchSignupEnabled } from "@/lib/settings";
import { AuthShell } from "./AuthShell";

export function SignupForm() {
  const router = useRouter();
  const [signupEnabled, setSignupEnabled] = useState<boolean | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { enabled } = await fetchSignupEnabled(supabase);
      setSignupEnabled(enabled);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signupEnabled) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabase = createClient();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { full_name: trimmedName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (signUpData.user) {
      const profileInput = profileInputFromUser(signUpData.user, trimmedName);
      const { ok, error: profileError } = await ensureProfileForUser(supabase, profileInput);

      if (!ok && signUpData.session) {
        const apiRes = await fetch("/api/auth/ensure-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: trimmedName }),
        });
        if (!apiRes.ok) {
          console.warn("ensure-profile:", profileError, await apiRes.text());
        }
      } else if (!ok) {
        console.warn("ensure-profile:", profileError);
      }
    }

    setSuccess("Account created. You can sign in now.");
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (signupEnabled === null) {
    return (
      <AuthShell title="Create" titleAccent="account" subtitle="Checking registration status…">
        <p className="auth-sub" style={{ marginBottom: 0 }}>
          Loading…
        </p>
      </AuthShell>
    );
  }

  if (!signupEnabled) {
    return (
      <AuthShell
        title="Sign up"
        titleAccent="closed"
        subtitle="New registrations are not available right now."
      >
        <div className="auth-info">
          The signup page is closed. If you already have an account, sign in below.
        </div>
        <Link
          href="/login"
          className="auth-btn"
          style={{ display: "block", textAlign: "center", textDecoration: "none" }}
        >
          Go to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create"
      titleAccent="account"
      subtitle="Register to access the DAX Formula Library."
    >
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-info">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className="auth-input"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
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
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <button type="submit" className="auth-btn" disabled={loading || !!success}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
