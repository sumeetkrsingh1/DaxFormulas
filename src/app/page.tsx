import DaxLibraryApp from "@/components/dax/DaxLibraryApp";
import { fetchProfileApproval } from "@/lib/profile-auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { isApproved } = await fetchProfileApproval(supabase, user.id);
  if (!isApproved) {
    redirect("/login?error=pending");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const userName =
    profile?.full_name?.trim() ||
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "User";

  return <DaxLibraryApp isAdmin={isAdmin} userName={userName} />;
}
