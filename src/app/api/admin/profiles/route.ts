import { NextResponse } from "next/server";
import { fetchAllProfiles } from "@/lib/admin-profiles";

export async function GET() {
  const { profiles, error } = await fetchAllProfiles();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json(profiles);
}
