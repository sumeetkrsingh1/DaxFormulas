"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  title: string;
  titleAccent?: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, titleAccent, subtitle, children }: Props) {
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    document.body.classList.add("auth-page");
    try {
      if (localStorage.getItem("dax-theme") === "light") setLightMode(true);
    } catch {
      /* ignore */
    }
    return () => document.body.classList.remove("auth-page");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light-mode", lightMode);
    try {
      localStorage.setItem("dax-theme", lightMode ? "light" : "dark");
    } catch {
      /* ignore */
    }
  }, [lightMode]);

  return (
    <div className="auth-wrap">
      <div className="auth-theme">
        <div
          className="theme-toggle"
          onClick={() => setLightMode((v) => !v)}
          role="button"
          tabIndex={0}
          title="Toggle light/dark mode"
        >
          <div className="toggle-track">
            <div className="toggle-thumb" />
          </div>
          <span className="toggle-label">{lightMode ? "Light" : "Dark"}</span>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo-img">
            <Image src="/logo.jpg" alt="Datacense" width={33} height={33} unoptimized />
          </div>
          <div>
            <div className="auth-brand-txt">
              DAX <span>Formula</span> Library
            </div>
            <div className="auth-brand-sub">Datacense · Power BI</div>
          </div>
        </div>
        <h1 className="auth-title">
          {title}
          {titleAccent ? (
            <>
              {" "}
              <span>{titleAccent}</span>
            </>
          ) : null}
        </h1>
        <p className="auth-sub">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
