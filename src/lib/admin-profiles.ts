import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth-types";

export async function fetchAllProfiles(): Promise<{
  profiles: Profile[];
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: rpcData, error: rpcError } = await supabase.rpc("admin_read_profiles");

  if (!rpcError && rpcData) {
    return { profiles: rpcData as Profile[], error: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_approved, role, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      profiles: [],
      error:
        rpcError?.message ??
        error.message ??
        "Could not load profiles. Run supabase/schema.sql (admin_read_profiles) or add profiles_select_admin policy.",
    };
  }

  return { profiles: (data as Profile[]) ?? [], error: null };
}

export async function setProfileApproval(
  id: string,
  is_approved: boolean,
): Promise<{ ok: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error: rpcError } = await supabase.rpc("admin_set_profile_approval", {
    uid: id,
    approved: is_approved,
  });

  if (!rpcError) {
    return { ok: true, error: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_approved })
    .eq("id", id);

  if (error) {
    return { ok: false, error: rpcError.message + " · " + error.message };
  }

  return { ok: true, error: null };
}
