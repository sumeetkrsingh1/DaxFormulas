import { NextResponse, type NextRequest } from "next/server";
import { setProfileApproval } from "@/lib/admin-profiles";

export async function POST(request: NextRequest) {
  let body: { id?: string; is_approved?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id, is_approved } = body;

  if (!id || typeof is_approved !== "boolean") {
    return NextResponse.json({ error: "id and is_approved are required" }, { status: 400 });
  }

  const { ok, error } = await setProfileApproval(id, is_approved);

  if (!ok) {
    return NextResponse.json({ error: error ?? "Failed to update approval" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
