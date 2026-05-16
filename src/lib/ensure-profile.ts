import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";

export type EnsureProfileInput = {
  id: string;
  email: string;
  fullName?: string | null;
};

export async function ensureProfileForUser(
  supabase: SupabaseClient,
  input: EnsureProfileInput,
): Promise<{ ok: boolean; error: string | null }> {
  const { error: rpcError } = await supabase.rpc("ensure_profile");

  if (!rpcError) {
    return { ok: true, error: null };
  }

  const service = createServiceClient();
  if (service) {
    const { error } = await service.from("profiles").upsert(
      {
        id: input.id,
        email: input.email,
        full_name: input.fullName?.trim() || null,
      },
      { onConflict: "id" },
    );

    if (!error) {
      return { ok: true, error: null };
    }

    return { ok: false, error: error.message };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: input.id,
      email: input.email,
      full_name: input.fullName?.trim() || null,
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      ok: false,
      error:
        rpcError.message +
        (error.message ? ` · ${error.message}` : "") +
        " · Run supabase/steps/17-ensure-profile-on-signup.sql in Supabase SQL Editor.",
    };
  }

  return { ok: true, error: null };
}

export function profileInputFromUser(user: User, fullName?: string): EnsureProfileInput {
  const meta = user.user_metadata as { full_name?: string } | undefined;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName: fullName ?? meta?.full_name ?? null,
  };
}
