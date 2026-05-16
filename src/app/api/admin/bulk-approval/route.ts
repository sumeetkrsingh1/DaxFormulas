import { NextResponse, type NextRequest } from "next/server";
import { setProfileApproval } from "@/lib/admin-profiles";

export async function POST(request: NextRequest) {
  let body: { ids?: string[]; is_approved?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { ids, is_approved } = body;

  if (!Array.isArray(ids) || typeof is_approved !== "boolean") {
    return NextResponse.json({ error: "ids (array) and is_approved (boolean) are required" }, { status: 400 });
  }

  if (ids.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const results = await Promise.all(
    ids.map(id => setProfileApproval(id, is_approved))
  );

  const failed = results.filter(r => !r.ok);
  if (failed.length > 0) {
    return NextResponse.json({ 
      error: `Failed to update ${failed.length} profile(s). First error: ${failed[0].error}` 
    }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
