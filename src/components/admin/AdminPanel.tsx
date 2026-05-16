"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@/lib/auth-types";

export function AdminPanel() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [signupEnabled, setSignupEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const profilesResponse = await fetch("/api/admin/profiles", { cache: "no-store" });
    if (profilesResponse.status === 401) {
      window.location.href = "/admin/login";
      return;
    }

    const profilesData = await profilesResponse.json();

    const signupResponse = await fetch("/api/admin/signup-enabled", { cache: "no-store" });
    const signupData = await signupResponse.json();

    if (profilesData?.error) {
      setError(profilesData.error);
      setLoading(false);
      return;
    }

    if (signupData?.error) {
      setError(signupData.error);
    }

    setUsers((profilesData as Profile[]) ?? []);
    setSignupEnabled(Boolean(signupData?.enabled));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleApproval(user: Profile) {
    const response = await fetch("/api/admin/approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, is_approved: !user.is_approved }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error ?? "Unable to update user approval.");
      return;
    }

    setMessage(
      !user.is_approved
        ? `Access granted for ${user.email}`
        : `Access revoked for ${user.email}`,
    );
    load();
  }

  async function toggleSignup() {
    const next = !signupEnabled;
    const response = await fetch("/api/admin/signup-enabled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error ?? "Failed to save signup setting");
      return;
    }

    setSignupEnabled(next);
    setMessage(next ? "Signup page is now open." : "Signup page is now closed.");
    await load();
  }

  async function signOut() {
    await fetch("/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="admin-page">
      <header className="hdr">
        <div className="hdr-l">
          <div>
            <div className="logo-txt">
              Admin <span>Console</span>
            </div>
            <div className="logo-sub">User access &amp; registration</div>
          </div>
        </div>
        <div className="hdr-r">
          <Link href="/" className="btn-sm btn-selall" style={{ textDecoration: "none" }}>
            ← Library
          </Link>
          <button type="button" className="btn-sm btn-clr" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-main">
        {message && <div className="auth-info admin-banner">{message}</div>}
        {error && <div className="auth-error admin-banner">{error}</div>}

        <section className="admin-section">
          <div className="admin-section-hdr">
            <h2>Registration</h2>
            <p>Control whether new users can open the signup page.</p>
          </div>
          <div className="admin-toggle-row">
            <span className={"admin-status " + (signupEnabled ? "on" : "off")}>
              Signup {signupEnabled ? "enabled" : "disabled"}
            </span>
            <button type="button" className="auth-btn admin-toggle-btn" onClick={toggleSignup}>
              {signupEnabled ? "Disable signup" : "Enable signup"}
            </button>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-hdr">
            <h2>Users ({users.length})</h2>
            <p>Approve or revoke login access. Only approved users can use the library.</p>
          </div>

          {loading ? (
            <p className="admin-loading">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="admin-loading">
              No users yet. If people have signed up but do not appear here, verify that
              Supabase is creating rows in <code>public.profiles</code> for new auth users.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Access</th>
                    <th>Joined</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.full_name || "—"}</td>
                      <td>
                        <span className={"admin-role " + u.role}>{u.role}</span>
                      </td>
                      <td>
                        <span className={"admin-pill " + (u.is_approved ? "ok" : "pending")}>
                          {u.is_approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString("en-GB")}</td>
                      <td>
                        <button
                          type="button"
                          className={"btn-sm " + (u.is_approved ? "btn-clr" : "btn-selall")}
                          onClick={() => toggleApproval(u)}
                        >
                          {u.is_approved ? "Revoke" : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
