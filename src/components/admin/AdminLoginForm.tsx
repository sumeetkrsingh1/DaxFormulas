"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(false);


    // Admin login removed; send users to standard login.
    router.push("/login");

  }


  return (
    <div className="admin-page">
      <header className="hdr">
        <div className="hdr-l">
          <div>
            <div className="logo-txt">
              Admin <span>Console</span>
            </div>
            <div className="logo-sub">Login to manage profiles</div>
          </div>
        </div>
        <div className="hdr-r">
          <button
            type="button"
            className="btn-sm btn-clr"
            onClick={() => (window.location.href = "/")}
          >
            ← Library
          </button>
        </div>
      </header>

      <main className="admin-main">
        {error && <div className="auth-error admin-banner">{error}</div>}

        <section className="admin-section">
          <div className="admin-section-hdr">
            <h2>Admin login</h2>
            <p>Enter admin email and password.</p>
          </div>

          <form onSubmit={onSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Verifying…" : "Sign in"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

