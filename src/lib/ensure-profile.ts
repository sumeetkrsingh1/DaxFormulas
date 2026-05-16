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
  const service = createServiceClient() || supabase;
  
  // 1. Attempt to insert as a new profile, forcing is_approved: true
  const { error: insertError } = await service.from("profiles").insert({
    id: input.id,
    email: input.email,
    full_name: input.fullName?.trim() || null,
    is_approved: true,
  });

  if (!insertError) {
    return { ok: true, error: null };
  }

  // 2. If insert fails (likely due to uniqueness constraint on id),
  // call the RPC fallback just in case it handles other DB logic
  const { error: rpcError } = await supabase.rpc("ensure_profile");

  // 3. Update the email and full_name for existing users, but LEAVE is_approved alone.
  const { error: updateError } = await service
    .from("profiles")
    .update({
      email: input.email,
      full_name: input.fullName?.trim() || null,
    })
    .eq("id", input.id);

  if (updateError) {
    return {
      ok: false,
      error: (rpcError?.message ?? "") + " · " + updateError.message,
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
