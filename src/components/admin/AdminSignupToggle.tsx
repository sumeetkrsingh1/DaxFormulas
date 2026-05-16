"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialEnabled: boolean;
};

export function AdminSignupToggle({ initialEnabled }: Props) {
  const router = useRouter();
  const [signupEnabled, setSignupEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggleSignup() {
    const next = !signupEnabled;
    setBusy(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/signup-enabled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload?.error ?? "Failed to save signup setting.");
      setBusy(false);
      return;
    }

    setSignupEnabled(next);
    setMessage(next ? "Signup page is now open." : "Signup page is now closed.");
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="admin-section">
      <div className="admin-section-hdr">
        <h2>Registration</h2>
        <p>Control whether new users can register on the signup page.</p>
      </div>

      {message && <div className="auth-info admin-banner">{message}</div>}
      {error && <div className="auth-error admin-banner">{error}</div>}

      <div className="admin-toggle-row">
        <span className={"admin-status " + (signupEnabled ? "on" : "off")}>
          Signup {signupEnabled ? "enabled" : "disabled"}
        </span>
        <button
          type="button"
          className="auth-btn admin-toggle-btn"
          disabled={busy}
          onClick={toggleSignup}
        >
          {busy ? "Saving…" : signupEnabled ? "Disable signup" : "Enable signup"}
        </button>
      </div>
    </section>
  );
}
