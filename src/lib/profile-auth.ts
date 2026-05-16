import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchProfileApproval(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ isApproved: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_approved")
    .eq("id", userId)
    .single();

  if (error) {
    return { isApproved: false, error: error.message };
  }

  if (!data) {
    return { isApproved: false, error: "Profile not found" };
  }

  return { isApproved: data.is_approved, error: null };
}

export const PENDING_APPROVAL_MESSAGE =
  "Your account is not approved yet. An administrator must grant you access before you can sign in.";

export const PROFILE_LOAD_ERROR_MESSAGE =
  "Could not load your profile. Please try again or contact support.";
