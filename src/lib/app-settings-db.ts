import type { SupabaseClient } from "@supabase/supabase-js";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export const SIGNUP_ENABLED_KEY = "signup_enabled" as const;

export type SignupEnabledSettingRow = {
  key: typeof SIGNUP_ENABLED_KEY;
  value: boolean;
};

/** JSONB boolean for `app_settings.value` — never use string "true" / "false". */
export function signupEnabledJsonbValue(enabled: boolean): Json {
  if (typeof enabled !== "boolean") {
    throw new TypeError("signup_enabled value must be a boolean");
  }
  return enabled;
}

export async function upsertSignupEnabledSetting(
  supabase: SupabaseClient,
  enabled: boolean,
): Promise<{ ok: boolean; error: string | null }> {
  const value = signupEnabledJsonbValue(enabled);
  const row: SignupEnabledSettingRow = { key: SIGNUP_ENABLED_KEY, value: enabled };

  const { data: existing } = await supabase
    .from("app_settings")
    .select("key")
    .eq("key", SIGNUP_ENABLED_KEY)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("app_settings")
      .update({ value })
      .eq("key", SIGNUP_ENABLED_KEY);

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, error: null };
  }

  const { error } = await supabase.from("app_settings").insert({
    key: row.key,
    value,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, error: null };
}
