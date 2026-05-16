"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CAT, GROUPS } from "@/lib/categories";
import { DM_CAT_MAP, typeBadgeClass } from "@/lib/dmUtils";
import { getFiltered, getSubs } from "@/lib/filters";
import { F } from "@/lib/formulas";
import { MODEL } from "@/lib/model";
import { buildScript } from "@/lib/scriptBuilder";
import { SIM } from "@/lib/sim";
import type { Formula, ModelTable } from "@/lib/types";
import { FormulaCard } from "./FormulaCard";
import { Toast } from "./Toast";

const FORMULAS = F as unknown as Formula[];

type DaxLibraryAppProps = {
  isAdmin?: boolean;
  userName?: string;
};

export default function DaxLibraryApp({ isAdmin = false, userName }: DaxLibraryAppProps) {
  const [activeCat, setActiveCat] = useState("all");
  const [activeSub, setActiveSub] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [simPeriod, setSimPeriod] = useState("YTD");
  const [simRef, setSimRef] = useState("Last Year");
  const [dmFilter, setDmFilter] = useState("all");
  const [dmSearch, setDmSearch] = useState("");
  const [dmOpenTables, setDmOpenTables] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [tableName, setTableName] = useState("0_Measures");
  const [lightMode, setLightMode] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [copyScriptOk, setCopyScriptOk] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [dmMobileFilterOpen, setDmMobileFilterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const dmSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("dax-theme") === "light") setLightMode(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light-mode", lightMode);
    try {
      localStorage.setItem("dax-theme", lightMode ? "light" : "dark");
    } catch {
      /* ignore */
    }
  }, [lightMode]);

  const showToast = useCallback((msg: string) => {
    setToastMsg("✅ " + msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2800);
  }, []);

  const filtered = useMemo(
    () => getFiltered(activeCat, activeSub, searchQ),
    [activeCat, activeSub, searchQ],
  );

  const subs = useMemo(() => getSubs(activeCat), [activeCat]);

  const selectedFormulas = useMemo(
    () => FORMULAS.filter((f) => selected.has(f.id)),
    [selected],
  );

  const script = useMemo(
    () => buildScript(tableName, selectedFormulas),
    [tableName, selectedFormulas],
  );

  const setCat = (c: string) => {
    setActiveCat(c);
    setActiveSub("all");
    setSidebarOpen(false);
    mainRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  };

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      filtered.forEach((f) => next.add(f.id));
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const copyOne = (id: number, btn: HTMLButtonElement) => {
    const f = FORMULAS.find((x) => x.id === id);
    if (!f) return;
    navigator.clipboard.writeText(f.dax).then(() => {
      btn.classList.add("ok");
      btn.textContent = "✅ Copied";
      showToast("Formula copied!");
      setTimeout(() => {
        btn.classList.remove("ok");
        btn.textContent = "📋 Copy";
      }, 2000);
    });
  };

  const openModal = () => {
    if (selected.size === 0) return;
    setModalOpen(true);
    setCopyScriptOk(false);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script).then(() => {
      setCopyScriptOk(true);
      showToast("DAX script copied — paste into Power BI DAX Query View");
      setTimeout(() => {
        setCopyScriptOk(false);
      }, 2500);
    });
  };

  const dmToggle = (tbl: string) => {
    setDmOpenTables((prev) => ({ ...prev, [tbl]: !prev[tbl] }));
    setTimeout(() => dmSearchRef.current?.focus(), 0);
  };

  const dmCopyCol = (e: React.MouseEvent, colRef: string, btn: HTMLButtonElement) => {
    e.stopPropagation();
    navigator.clipboard.writeText(colRef).then(() => {
      btn.classList.add("ok");
      btn.textContent = "✅";
      showToast("Copied: " + colRef);
      setTimeout(() => {
        btn.classList.remove("ok");
        btn.textContent = "📋";
      }, 1800);
    });
  };

  const cfg = CAT[activeCat as keyof typeof CAT] || CAT.all;

  const renderDynamicPanel = () => (
    <>
      <div className="dyn-banner">
        <div className="dyn-banner-title">
          🔀 <span>Dynamic Comparison Engine</span>
        </div>
        <div className="dyn-banner-sub">
          One set of measures that switches period (MTD/QTD/YTD/Full) AND reference (Last Year/Target/Forecast) from two
          disconnected slicers. No duplicate measures needed.
        </div>
        <div className="dyn-pills">
          {["📅 Period Switcher", "🎯 Reference Switcher", "± Variance £ & %", "🟢 RAG Status", "📊 Always-On Growth Rates"].map(
            (p) => (
              <span key={p} className="dyn-pill">
                {p}
              </span>
            ),
          )}
        </div>
      </div>
      <div className="setup-box">
        <div className="setup-title">⚙️ Step 1 — Create These Two Disconnected Tables in Power BI</div>
        <div className="setup-grid">
          <div className="setup-tbl">
            <div className="setup-tbl-name">PeriodSel</div>
            <div
              className="setup-tbl-code"
              dangerouslySetInnerHTML={{
                __html:
                  'PeriodSel = DATATABLE(<br>&nbsp;&nbsp;&quot;Period&quot;, STRING,<br>&nbsp;&nbsp;{{&quot;MTD&quot;},{&quot;QTD&quot;},{&quot;YTD&quot;},{&quot;Full Period&quot;}})',
              }}
            />
            <div className="setup-tbl-note">Place as a slicer on every page. No relationship to other tables.</div>
          </div>
          <div className="setup-tbl">
            <div className="setup-tbl-name">Comparison</div>
            <div
              className="setup-tbl-code"
              dangerouslySetInnerHTML={{
                __html:
                  'Comparison = DATATABLE(<br>&nbsp;&nbsp;&quot;Reference&quot;, STRING,<br>&nbsp;&nbsp;{{&quot;Last Year&quot;},{&quot;Target&quot;},{&quot;Forecast&quot;}})',
              }}
            />
            <div className="setup-tbl-note">Place as a button slicer. No relationship to other tables.</div>
          </div>
        </div>
      </div>
      <SimBox simPeriod={simPeriod} simRef={simRef} setSimPeriod={setSimPeriod} setSimRef={setSimRef} />
      <div className="flow-box">
        <div className="flow-title">📐 How It Works</div>
        <div className="flow-steps">
          {[
            ["Step 1", "User picks Period", "MTD/QTD/YTD/Full"],
            ["Step 2", "User picks Reference", "LY/Target/Forecast"],
            ["Step 3", "SELECTEDVALUE reads slicers", "SWITCH(TRUE(),...)"],
            ["Step 4", "18 measures auto-recalculate", "Actual, Ref, Var, RAG..."],
            ["Result", "All visuals update instantly", "12 combos, 2 slicers"],
          ].map(([num, txt, sub], i, arr) => (
            <DynamicFlow key={num} num={num} txt={txt} sub={sub} showArrow={i < arr.length - 1} />
          ))}
        </div>
        <div className="dyn-note">
          <strong>Power BI tip:</strong> Use SELECTEDVALUE(PeriodSel[Period], &quot;Full Period&quot;) — the 2nd argument is
          the default. Enable single-select on both slicers.
        </div>
      </div>
      <div className="section-divider">
        <div className="section-divider-l">📋 All 18 Dynamic Measures</div>
        <div className="section-divider-r">Select any to include in batch script</div>
      </div>
    </>
  );

  const renderDataModel = () => {
    const catMap = DM_CAT_MAP;
    const filteredTables = (MODEL as unknown as ModelTable[]).filter((t) => {
      if (dmFilter !== "all" && !t.usedIn.includes(dmFilter)) return false;
      if (dmSearch) {
        const q = dmSearch.toLowerCase();
        if (t.table.toLowerCase().includes(q)) return true;
        return t.cols.some(
          (c) => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
        );
      }
      return true;
    });

    const allCats: Record<string, number> = {};
    (MODEL as unknown as ModelTable[]).forEach((t) =>
      t.usedIn.forEach((c) => {
        allCats[c] = 1;
      }),
    );

    return (
      <>
        <div className="dm-hero">
          <div className="dm-hero-title">
            📐 <span>Data Model Reference</span>
          </div>
          <div className="dm-hero-sub">
            Every table and column used in the formula library — plus recommended extras clearly marked. Build your Power BI
            model with these exact names and the DAX formulas will work with zero changes.
          </div>
          <div className="dm-stats">
            <div className="dm-stat">
              <div className="dm-stat-n">{MODEL.length}</div>
              <div className="dm-stat-l">Tables</div>
            </div>
            <div className="dm-stat">
              <div className="dm-stat-n">144</div>
              <div className="dm-stat-l">Formula Columns</div>
            </div>
            <div className="dm-stat">
              <div className="dm-stat-n">117</div>
              <div className="dm-stat-l">Recommended Extras</div>
            </div>
            <div className="dm-stat">
              <div className="dm-stat-n">261</div>
              <div className="dm-stat-l">Total Columns</div>
            </div>
          </div>
        </div>
        <div className="dm-legend">
          <span>Legend:</span>
          <span className="dm-legend-item">
            <span className="src-formula">Formula</span> required by DAX formulas — exact name matters
          </span>
          <span className="dm-legend-item">
            <span className="src-recommended">Extra</span> recommended for a complete model
          </span>
        </div>
        <div className="dm-search">
          <div className="dm-srch-wrap">
            <span className="dm-srch-ico">🔍</span>
            <input
              ref={dmSearchRef}
              className="dm-srch"
              type="text"
              placeholder="Search tables and columns…"
              value={dmSearch}
              onChange={(e) => setDmSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="dm-filter-bar" onClick={() => setDmMobileFilterOpen(!dmMobileFilterOpen)}>
          <span className="dm-filter-lbl">Filter by dept: {dmMobileFilterOpen ? "▼" : "▶"}</span>
          <div className={"dm-filter-opts" + (dmMobileFilterOpen ? " open" : "")}>
            <button
              type="button"
              className={"dm-fpill" + (dmFilter === "all" ? " active" : "")}
              onClick={(e) => { e.stopPropagation(); setDmFilter("all"); }}
            >
              All Tables
            </button>
            {Object.keys(allCats).map((c) => (
              <button
                key={c}
                type="button"
                className={"dm-fpill" + (dmFilter === c ? " active" : "")}
                onClick={(e) => { e.stopPropagation(); setDmFilter(c); }}
              >
                {catMap[c]}
              </button>
            ))}
          </div>
        </div>
        {filteredTables.length === 0 ? (
          <div className="dm-empty">No tables match your search.</div>
        ) : (
          <div className="dm-grid">
            {filteredTables.map((t) => {
              const isOpen = !!dmOpenTables[t.table];
              const formulaCount = t.cols.filter((c) => c.source === "formula").length;
              const extraCount = t.cols.length - formulaCount;
              return (
                <div key={t.table} className="dm-table">
                  <div className="dm-table-hdr" onClick={() => dmToggle(t.table)}>
                    <div className="dm-table-hdr-l">
                      <span className="dm-table-ico">{t.emoji}</span>
                      <div>
                        <div className="dm-table-name">{t.table}</div>
                        <div className="dm-table-desc">
                          {t.desc.substring(0, 80)}
                          {t.desc.length > 80 ? "…" : ""}
                        </div>
                      </div>
                    </div>
                    <div className="dm-table-hdr-r">
                      <span className="dm-col-count">
                        {formulaCount} formula · {extraCount} extra
                      </span>
                      <span className={"dm-chevron" + (isOpen ? " open" : "")}>▼</span>
                    </div>
                  </div>
                  <div className={"dm-table-body" + (isOpen ? " open" : "")}>
                    <div className="dm-used-in">
                      {t.usedIn.map((c) => (
                        <span key={c} className="dm-used-pill">
                          {catMap[c]}
                        </span>
                      ))}
                    </div>
                    <div className="dm-note">
                      <strong>📝 Setup note:</strong> {t.note}
                    </div>
                    <table className="dm-col-table">
                      <thead>
                        <tr>
                          <th>Column</th>
                          <th>Type</th>
                          <th>Source</th>
                          <th>What it means</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {t.cols.map((col) => {
                          const colRef = t.table + "[" + col.name + "]";
                          return (
                            <tr key={col.name} className="dm-col-row">
                              <td className="dm-col-name">{col.name}</td>
                              <td className="dm-col-type-cell">
                                <span className={typeBadgeClass(col.type)}>{col.type}</span>
                              </td>
                              <td className="dm-col-type-cell">
                                <span className={"src-" + col.source}>
                                  {col.source === "formula" ? "Formula" : "Extra"}
                                </span>
                              </td>
                              <td className="dm-col-desc-cell">{col.desc}</td>
                              <td className="dm-col-actions">
                                <button
                                  type="button"
                                  className="dm-copy-btn"
                                  title={"Copy " + colRef}
                                  onClick={(e) =>
                                    dmCopyCol(e, colRef, e.currentTarget as HTMLButtonElement)
                                  }
                                >
                                  📋
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const renderMainContent = () => {
    if (activeCat === "datamodel") return renderDataModel();

    if (activeCat === "dynamic" && !searchQ) {
      return (
        <>
          {renderDynamicPanel()}
          <div className="formula-grid">
            {FORMULAS.filter((f) => f.cat === "dynamic").map((f) => (
              <FormulaCard
                key={f.id}
                formula={f}
                selected={selected.has(f.id)}
                onToggle={toggle}
                onCopy={copyOne}
              />
            ))}
          </div>
        </>
      );
    }

    return (
      <>
        {activeCat === "all" && !searchQ ? (
          <div className="welcome">
            <div className="welcome-title">
              Power BI <span>DAX Formula</span> Library
            </div>
            <div className="welcome-sub">
              380 ready-made measures. Select formulas and generate a deployment script for Power BI Desktop.
            </div>
            <div className="welcome-pills">
              {["📋 Copy & Paste Ready", "🔲 Multi-Select + Script", "⚡ 380 Formulas", "📅 62 Time Intelligence", "🔀 Dynamic Comparison"].map(
                (p) => (
                  <span key={p} className="wpill">
                    {p}
                  </span>
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="cat-hero">
            <span className="cat-ico">{cfg.ico}</span>
            <div className="cat-info">
              <div className="cat-title">
                <span>{cfg.title}</span>
              </div>
              <div className="cat-desc">{cfg.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="stat-n">{filtered.length}</div>
              <div className="stat-l">Showing</div>
            </div>
          </div>
        )}

        {activeCat === "time" && !searchQ && (
          <div className="kpi-tip">
            <div className="kpi-tip-title">🔁 [KPI] Prefix — Find &amp; Replace in 5 Seconds</div>
            <div className="kpi-tip-body">
              Every time formula uses <code>[KPI]</code> as a placeholder. Generate the script, then Find &amp; Replace{" "}
              <code>[KPI]</code> with: <code>Revenue</code> · <code>Cost</code> · <code>Headcount</code> · <code>Units</code> ·{" "}
              <code>Margin</code>
            </div>
            <div className="kpi-pills">
              <span className="kpi-pill">Find: [KPI]</span>
              <span className="kpi-pill">Replace: Revenue → Revenue MTD, Revenue YTD…</span>
              <span className="kpi-pill">Replace: Cost → Cost MTD, Cost YTD…</span>
            </div>
          </div>
        )}

        <div className="sel-bar">
          <div className="sel-bar-l">
            <span className="sel-cnt">{selected.size}</span> selected for batch script
          </div>
          <div className="sel-bar-r">
            {selected.size > 0 && (
              <button type="button" className="btn-sm btn-clr" onClick={clearAll}>
                Clear All
              </button>
            )}
            <button type="button" className="btn-sm btn-selall" onClick={selectAll}>
              Select All Visible
            </button>
            <button type="button" className="btn-gen" onClick={openModal} disabled={selected.size === 0}>
              ⚡ Generate Script
            </button>
          </div>
        </div>

        {subs.length > 1 && (
          <div className="filter-bar" onClick={() => setMobileFilterOpen(!mobileFilterOpen)}>
            <span className="filter-lbl">Filter: {mobileFilterOpen ? "▼" : "▶"}</span>
            <div className={"filter-opts" + (mobileFilterOpen ? " open" : "")}>
              <button
                type="button"
                className={"fpill" + (activeSub === "all" ? " active" : "")}
                onClick={(e) => { e.stopPropagation(); setActiveSub("all"); }}
              >
                All
              </button>
              {subs.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={"fpill" + (activeSub === s ? " active" : "")}
                  onClick={(e) => { e.stopPropagation(); setActiveSub(s); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {searchQ && (
          <div className="results-info">
            <span>{filtered.length}</span> results for &quot;{searchQ}&quot;
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="empty">
            <div style={{ fontSize: "2.5rem", opacity: 0.4, marginBottom: ".75rem" }}>🔍</div>
            <p>No formulas match. Try a different keyword.</p>
          </div>
        ) : (
          <div className="formula-grid">
            {filtered.map((f) => (
              <FormulaCard
                key={f.id}
                formula={f}
                selected={selected.has(f.id)}
                onToggle={toggle}
                onCopy={copyOne}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  const handleSearch = (q: string) => {
    setSearchQ(q);
    if (q.trim()) setActiveCat("all");
  };

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <header className="hdr">
        <div className="hdr-l">
          <button type="button" className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="logo-img">
            <Image src="/logo.jpg" alt="Datacense" width={33} height={33} unoptimized />
          </div>
          <div>
            <div className="logo-txt">
              DAX <span>Formula</span> Library
            </div>
            <div className="logo-sub">Datacense · Power BI · 380 Ready-Made Measures</div>
          </div>
        </div>
        <div className="hdr-r">
          <span className="company-tag">Datacense</span>
          <div className="hdr-badge" id="totalBadge">
            ⚡ 380 Formulas
          </div>
          <div className="srch-wrap">
            <svg className="srch-ico" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="srch"
              type="text"
              placeholder="Search formulas…"
              id="searchInput"
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {userName && (
            <span
              className="hdr-badge"
              title={userName}
              style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {userName}
            </span>
          )}
          <button type="button" className="btn-sm btn-clr" onClick={handleSignOut}>
            Sign out
          </button>
          <div className="theme-toggle" onClick={() => setLightMode((v) => !v)} title="Toggle light/dark mode" role="button" tabIndex={0}>
            <div className="toggle-track">
              <div className="toggle-thumb" />
            </div>
            <span className="toggle-label" id="themeLabel">
              {lightMode ? "Light" : "Dark"}
            </span>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className={"sidebar" + (sidebarOpen ? " open" : "")} id="sidebar">
          {GROUPS.map((g, gi) => (
            <div key={g.label}>
              {gi > 0 && <div className="sb-div" />}
              <div className="sb-lbl">{g.label}</div>
              {g.items.map((c) => {
                const catCfg = CAT[c as keyof typeof CAT];
                const cnt =
                  c === "datamodel"
                    ? MODEL.length + " tables"
                    : c === "all"
                      ? FORMULAS.length
                      : FORMULAS.filter((f) => f.cat === c).length;
                return (
                  <div
                    key={c}
                    className={"sb-item" + (activeCat === c ? " active" : "")}
                    onClick={() => setCat(c)}
                    role="button"
                    tabIndex={0}
                  >
                    <span>{catCfg.ico}</span> {catCfg.title}{" "}
                    <span className="sb-badge">{cnt}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </aside>

        <main className="main" id="mainContent" ref={mainRef}>
          {renderMainContent()}
        </main>
      </div>

      <div className={"float-bar" + (selected.size > 0 ? " visible" : "")} id="floatBar">
        <div className="float-bar-info">
          <div className="float-bar-count" id="floatCount">
            {selected.size} formula{selected.size !== 1 ? "s" : ""} selected
          </div>
          <div className="float-bar-hint">Generate script → paste in Power BI DAX Query View → F5</div>
        </div>
        <button type="button" className="btn-clear-all" onClick={clearAll}>
          ✕ Clear
        </button>
        <button type="button" className="btn-generate" onClick={openModal}>
          ⚡ Generate DAX Script
        </button>
      </div>

      <div
        className={"modal-overlay" + (modalOpen ? " open" : "")}
        id="modalOverlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-hdr">
            <div>
              <div className="modal-title">
                Generated <span>DAX Script</span>
              </div>
              <div className="modal-sub" id="modalSub">
                {selected.size} measure{selected.size !== 1 ? "s" : ""} → &apos;{tableName}&apos; table
              </div>
            </div>
            <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>
              ✕
            </button>
          </div>
          <div className="modal-toolbar">
            <span className="tbl-label">Target Table:</span>
            <input
              className="tbl-input"
              id="tableNameInput"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>
          <div className="modal-body">
            <div className="inst-box">
              <div className="inst-title">📋 How to deploy in Power BI Desktop</div>
              {[
                "Copy the script below",
                "Open Power BI Desktop → Home → DAX Query View",
                "Paste and press F5 (Run)",
                "All measures created in the target table automatically",
                "For [KPI] time formulas: Find & Replace [KPI] with Revenue, Cost, Headcount etc.",
              ].map((step, i) => (
                <div key={step} className="inst-step">
                  <div className="inst-num">{i + 1}</div>
                  {step}
                </div>
              ))}
            </div>
            <div className="dax-script-box" id="daxScriptBox">
              {script}
            </div>
          </div>
          <div className="modal-ftr">
            <div className="modal-ftr-l" id="modalFtrTxt">
              <strong>{selected.size} measures</strong> → <strong style={{ color: "var(--gold)" }}>{tableName}</strong>
            </div>
            <div style={{ display: "flex", gap: ".5rem" }}>
              <button type="button" className="btn-modal-close2" onClick={() => setModalOpen(false)}>
                Close
              </button>
              <button
                type="button"
                className={"btn-copy-script" + (copyScriptOk ? " ok" : "")}
                id="btnCopyScript"
                onClick={copyScript}
              >
                {copyScriptOk ? "✅ Copied!" : "📋 Copy Script"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMsg} show={toastShow} />
    </>
  );
}

function SimBox({
  simPeriod,
  simRef,
  setSimPeriod,
  setSimRef,
}: {
  simPeriod: string;
  simRef: string;
  setSimPeriod: (p: string) => void;
  setSimRef: (r: string) => void;
}) {
  const refKey = simRef === "Last Year" ? "ly" : simRef === "Target" ? "target" : "forecast";
  const act = SIM.actual[simPeriod as keyof typeof SIM.actual];
  const ref = SIM[refKey as "ly" | "target" | "forecast"][simPeriod as keyof typeof SIM.actual];
  const varAbs = act - ref;
  const varPct = ref !== 0 ? (act - ref) / ref : 0;
  const ragCls = varPct >= 0.05 ? "g" : varPct <= -0.05 ? "r" : "a";
  const ragLbl = varPct >= 0.05 ? "🟢 Green" : varPct <= -0.05 ? "🔴 Red" : "🟡 Amber";
  const dirLbl = varPct >= 0.05 ? "▲ Ahead" : varPct <= -0.05 ? "▼ Behind" : "● On Track";
  const gap = Math.max(ref - act, 0);
  const fmt = (n: number) => "£" + Math.abs(n).toLocaleString("en-GB");
  const fmtP = (v: number) => {
    const s = v >= 0 ? "+" : "−";
    return s + (Math.abs(v) * 100).toFixed(1) + "%";
  };
  const cls = (v: number) => (v >= 0.05 ? "g" : v <= -0.05 ? "r" : "a");
  const lyP = (act - SIM.ly[simPeriod as keyof typeof SIM.ly]) / SIM.ly[simPeriod as keyof typeof SIM.ly];
  const tgtP = (act - SIM.target[simPeriod as keyof typeof SIM.target]) / SIM.target[simPeriod as keyof typeof SIM.target];
  const fctP = (act - SIM.forecast[simPeriod as keyof typeof SIM.forecast]) / SIM.forecast[simPeriod as keyof typeof SIM.forecast];

  const kpis = [
    { cls: "gold", label: "Actual Dynamic [" + simPeriod + "]", val: fmt(act), sub: "[Actual Dynamic]", badge: "" },
    { cls: "gold", label: "Reference [" + simRef + "]", val: fmt(ref), sub: "[Reference Value]", badge: "" },
    {
      cls: ragCls,
      label: "Variance £",
      val: (varAbs >= 0 ? "+" : "-") + fmt(varAbs),
      sub: "[Variance Absolute]",
      badge: dirLbl,
    },
    { cls: ragCls, label: "Variance %", val: fmtP(varPct), sub: "[Variance %]", badge: ragLbl },
    {
      cls: gap > 0 ? "r" : "g",
      label: "Remaining Gap",
      val: gap > 0 ? fmt(gap) : "✓ Exceeded",
      sub: "[Remaining Gap]",
      badge: gap > 0 ? "Still needed" : "Target beat",
    },
    { cls: cls(lyP), label: "vs Last Year", val: fmtP(lyP), sub: "[Growth % vs LY]", badge: "" },
    { cls: cls(tgtP), label: "vs Target", val: fmtP(tgtP), sub: "[Achievement % vs Target]", badge: "" },
    { cls: cls(fctP), label: "vs Forecast", val: fmtP(fctP), sub: "[Variance % vs Forecast]", badge: "" },
  ];

  return (
    <div className="sim-box">
      <div className="sim-title">
        <div className="sim-dot" /> Live Simulator — Click buttons to see how measures respond
      </div>
      <div className="sim-controls">
        <div className="sim-grp">
          <div className="sim-grp-lbl">📅 Period</div>
          <div className="sim-btns" id="simPBtns">
            {["MTD", "QTD", "YTD", "Full Period"].map((p) => (
              <button
                key={p}
                type="button"
                className={"sim-btn" + (simPeriod === p ? " on" : "")}
                onClick={() => setSimPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="sim-grp">
          <div className="sim-grp-lbl">🎯 Compare Against</div>
          <div className="sim-btns" id="simRBtns">
            {["Last Year", "Target", "Forecast"].map((r) => (
              <button
                key={r}
                type="button"
                className={"sim-btn" + (simRef === r ? " on" : "")}
                onClick={() => setSimRef(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="sim-output" id="simOut">
        {kpis.map((k) => (
          <div key={k.label} className={"sim-kpi " + k.cls}>
            <div className="sim-kpi-lbl">{k.label}</div>
            <div className="sim-kpi-val">{k.val}</div>
            <div className="sim-kpi-sub">{k.sub}</div>
            {k.badge ? <div className="sim-badge">{k.badge}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function DynamicFlow({
  num,
  txt,
  sub,
  showArrow,
}: {
  num: string;
  txt: string;
  sub: string;
  showArrow: boolean;
}) {
  return (
    <>
      <div className="flow-step">
        <div className="flow-num">{num}</div>
        <div className="flow-txt">{txt}</div>
        <div className="flow-sub">{sub}</div>
      </div>
      {showArrow && <div className="flow-arr">→</div>}
    </>
  );
}