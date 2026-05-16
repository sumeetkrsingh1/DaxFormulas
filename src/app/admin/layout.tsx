"use client";

import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("admin-body");
    return () => document.body.classList.remove("admin-body");
  }, []);

  return children;
}
