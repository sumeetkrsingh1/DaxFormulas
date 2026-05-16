"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/auth-types";

type Props = {
  profiles: Profile[];
  error?: string | null;
};

export function AdminProfilesTable({ profiles: initialProfiles, error: initialError }: Props) {
  const router = useRouter();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleApproval(user: Profile) {
    const nextApproved = !user.is_approved;
    setBusyId(user.id);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, is_approved: nextApproved }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload?.error ?? "Unable to update approval.");
      setBusyId(null);
      return;
    }

    setProfiles((prev) =>
      prev.map((p) => (p.id === user.id ? { ...p, is_approved: nextApproved } : p)),
    );
    setMessage(
      nextApproved ? `Access granted for ${user.email}` : `Access revoked for ${user.email}`,
    );
    setBusyId(null);
    router.refresh();
  }

  return (
    <section className="admin-section">
      <div className="admin-section-hdr">
        <h2>Users ({profiles.length})</h2>
        <p>Approve or revoke login access for each user.</p>
      </div>

      {message && <div className="auth-info admin-banner">{message}</div>}
      {error && <div className="auth-error admin-banner">{error}</div>}

      {profiles.length === 0 && !error ? (
        <p className="admin-loading">No profiles yet.</p>
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
              {profiles.map((u) => (
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
                      disabled={busyId === u.id}
                      onClick={() => toggleApproval(u)}
                    >
                      {busyId === u.id
                        ? "Saving…"
                        : u.is_approved
                          ? "Revoke"
                          : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
