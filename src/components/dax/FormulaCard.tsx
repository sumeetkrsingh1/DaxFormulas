"use client";

import { hl } from "@/lib/daxHighlight";
import type { Formula } from "@/lib/types";

type Props = {
  formula: Formula;
  selected: boolean;
  onToggle: (id: number) => void;
  onCopy: (id: number, btn: HTMLButtonElement) => void;
};

export function FormulaCard({ formula: f, selected, onToggle, onCopy }: Props) {
  const diffCap = f.diff.charAt(0).toUpperCase() + f.diff.slice(1);
  const stroke = selected ? "#0B1120" : "transparent";

  return (
    <div className={"formula-card" + (selected ? " selected" : "")} id={"card-" + f.id}>
      <div className="card-hdr">
        <div className="card-l">
          <div
            className={"chk" + (selected ? " on" : "")}
            onClick={() => onToggle(f.id)}
            role="checkbox"
            aria-checked={selected}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onToggle(f.id);
            }}
          >
            <svg fill="none" stroke={stroke} strokeWidth="3" viewBox="0 0 12 12" width="9" height="9">
              <polyline points="2,6 5,9 10,3" />
            </svg>
          </div>
          <div className="card-tw">
            <div className="card-title">{f.title}</div>
            <div className="card-q">{f.q}</div>
            <div className="card-tags">
              <span className={"ctag " + f.diff}>{diffCap}</span>
              <span className="ctag">{f.sub}</span>
              {f.tags.map((t) => (
                <span key={t} className="ctag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <button type="button" className="copy-btn" onClick={(e) => onCopy(f.id, e.currentTarget)}>
          📋 Copy
        </button>
      </div>
      <pre className="code-block" dangerouslySetInnerHTML={{ __html: hl(f.dax) }} />
      <div className="card-ftr">
        <span className="ins-ico">💡</span>
        <span className="ins-txt" dangerouslySetInnerHTML={{ __html: f.insight }} />
      </div>
    </div>
  );
}
