import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchSignupEnabled, setSignupEnabled } from "@/lib/settings";

export async function GET() {
  const supabase = await createClient();
  const { enabled, error } = await fetchSignupEnabled(supabase);

  if (error) {
    return NextResponse.json({ enabled, error }, { status: 200 });
  }

  return NextResponse.json({ enabled });
}

export async function POST(request: NextRequest) {
  let body: { enabled?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }

  const supabase = await createClient();
  const { ok, error } = await setSignupEnabled(supabase, body.enabled);

  if (!ok) {
    return NextResponse.json({ error: error ?? "Failed to save setting" }, { status: 500 });
  }

  return NextResponse.json({ enabled: body.enabled });
}
