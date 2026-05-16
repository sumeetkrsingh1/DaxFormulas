import Link from "next/link";
import { AdminProfilesTable } from "@/components/admin/AdminProfilesTable";
import { AdminSignupToggle } from "@/components/admin/AdminSignupToggle";
import { fetchAllProfiles } from "@/lib/admin-profiles";
import { createClient } from "@/lib/supabase/server";
import { fetchSignupEnabled } from "@/lib/settings";

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ profiles, error }, { enabled: signupEnabled }] = await Promise.all([
    fetchAllProfiles(),
    fetchSignupEnabled(supabase),
  ]);

  return (
    <div className="admin-page">
      <header className="hdr">
        <div className="hdr-l">
          <div>
            <div className="logo-txt">
              Admin <span>Panel</span>
            </div>
            <div className="logo-sub">Datacense · DAX Formula Library</div>
          </div>
        </div>
        <div className="hdr-r">
          <Link href="/" className="btn-sm btn-selall" style={{ textDecoration: "none" }}>
            ← Library
          </Link>
        </div>
      </header>

      <main className="admin-main">
        <AdminSignupToggle initialEnabled={signupEnabled} />
        <AdminProfilesTable profiles={profiles} error={error} />
      </main>
    </div>
  );
}
