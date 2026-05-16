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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busyBulk, setBusyBulk] = useState(false);

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

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === profiles.length && profiles.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(profiles.map((p) => p.id)));
    }
  }

  async function handleBulk(approve: boolean) {
    if (selectedIds.size === 0) return;
    setBusyBulk(true);
    setError(null);
    setMessage(null);

    const ids = Array.from(selectedIds);
    const response = await fetch("/api/admin/bulk-approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, is_approved: approve }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(payload?.error ?? "Unable to perform bulk update.");
      setBusyBulk(false);
      return;
    }

    setProfiles((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, is_approved: approve } : p)),
    );
    setMessage(
      `Access ${approve ? "granted" : "revoked"} for ${selectedIds.size} user(s).`,
    );
    setSelectedIds(new Set());
    setBusyBulk(false);
    router.refresh();
  }

  const allSelected = profiles.length > 0 && selectedIds.size === profiles.length;

  return (
    <section className="admin-section">
      <div className="admin-section-hdr" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Users ({profiles.length})</h2>
          <p>Approve or revoke login access for each user.</p>
        </div>
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', alignSelf: 'center', marginRight: '0.5rem' }}>{selectedIds.size} selected</span>
            <button 
              type="button" 
              className="btn-sm btn-selall" 
              disabled={busyBulk}
              onClick={() => handleBulk(true)}
            >
              {busyBulk ? "Processing..." : "Approve Selected"}
            </button>
            <button 
              type="button" 
              className="btn-sm btn-clr" 
              disabled={busyBulk}
              onClick={() => handleBulk(false)}
            >
              {busyBulk ? "Processing..." : "Revoke Selected"}
            </button>
          </div>
        )}
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
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={allSelected} 
                    onChange={toggleSelectAll} 
                    style={{ cursor: 'pointer' }}
                  />
                </th>
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
                <tr key={u.id} style={{ background: selectedIds.has(u.id) ? 'var(--surface2)' : 'transparent' }}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(u.id)} 
                      onChange={() => toggleSelect(u.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
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
                  <td>{new Date(u.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td>
                    <button
                      type="button"
                      className={"btn-sm " + (u.is_approved ? "btn-clr" : "btn-selall")}
                      disabled={busyId === u.id || busyBulk}
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
