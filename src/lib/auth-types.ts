export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  is_approved: boolean;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

/** `app_settings.value` for signup_enabled is a jsonb boolean (`true` / `false`). */
export type AppSettingSignupEnabled = {
  key: "signup_enabled";
  value: boolean;
  updated_at: string;
};

export type AppSetting = AppSettingSignupEnabled | {
  key: string;
  value: boolean | Record<string, unknown>;
  updated_at: string;
};
