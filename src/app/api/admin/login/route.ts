// Admin login RPC endpoint removed.
// The app should use standard Supabase Auth (/login, /signup, /auth/*).

import { NextResponse, type NextRequest } from "next/server";

export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: "Admin login removed. Use /login." }, { status: 410 });
}

