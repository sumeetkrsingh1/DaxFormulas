import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileForUser, profileInputFromUser } from "@/lib/ensure-profile";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { fullName?: string } = {};
  try {
    body = await request.json();
  } catch {
    /* optional body */
  }

  const { ok, error } = await ensureProfileForUser(
    supabase,
    profileInputFromUser(user, body.fullName),
  );

  if (!ok) {
    return NextResponse.json({ error: error ?? "Could not create profile" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
