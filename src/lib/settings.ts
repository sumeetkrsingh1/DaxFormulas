import type { SupabaseClient } from "@supabase/supabase-js";
import { upsertSignupEnabledSetting } from "@/lib/app-settings-db";
import { createServiceClient } from "@/lib/supabase/service";

/** Parse jsonb `value` when reading (handles legacy string forms). */
export function parseSignupEnabled(value: unknown): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (value === 1) return true;
  if (value === 0) return false;

  if (typeof value === "string") {
    const s = value.trim().toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
    try {
      return parseSignupEnabled(JSON.parse(value));
    } catch {
      return false;
    }
  }

  if (typeof value === "object" && value !== null) {
    const o = value as Record<string, unknown>;
    if ("enabled" in o) return parseSignupEnabled(o.enabled);
    if ("signup_enabled" in o) return parseSignupEnabled(o.signup_enabled);
  }

  return false;
}

export async function fetchSignupEnabled(
  supabase: SupabaseClient,
): Promise<{ enabled: boolean; error: string | null }> {
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_signup_enabled");

  if (!rpcError && typeof rpcData === "boolean") {
    return { enabled: rpcData, error: null };
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "signup_enabled")
    .maybeSingle();

  if (error) {
    return {
      enabled: true,
      error: rpcError?.message ?? error.message,
    };
  }

  if (!data) {
    return { enabled: true, error: null };
  }

  return { enabled: parseSignupEnabled(data.value), error: null };
}

export async function setSignupEnabled(
  supabase: SupabaseClient,
  enabled: boolean,
): Promise<{ ok: boolean; error: string | null }> {
  if (typeof enabled !== "boolean") {
    return { ok: false, error: "enabled must be a boolean" };
  }

  const { error: adminRpcError } = await supabase.rpc("admin_set_signup_enabled", {
    enabled,
  });

  if (!adminRpcError) {
    return { ok: true, error: null };
  }

  const service = createServiceClient();
  if (service) {
    const serviceResult = await upsertSignupEnabledSetting(service, enabled);
    if (serviceResult.ok) {
      return serviceResult;
    }
  }

  const { error: rpcError } = await supabase.rpc("set_signup_enabled", { enabled });

  if (!rpcError) {
    return { ok: true, error: null };
  }

  const directResult = await upsertSignupEnabledSetting(supabase, enabled);
  if (directResult.ok) {
    return directResult;
  }

  const hints: string[] = [];
  if (adminRpcError.message.includes("admin_set_signup_enabled")) {
    hints.push("Run supabase/steps/15-admin-set-signup-enabled.sql in Supabase SQL Editor");
  }
  if (!service) {
    hints.push("Or add SUPABASE_SERVICE_ROLE_KEY to .env.local for server-side updates");
  }

  return {
    ok: false,
    error: [adminRpcError.message, rpcError.message, directResult.error, hints.join(". ")]
      .filter(Boolean)
      .join(" · "),
  };
}
