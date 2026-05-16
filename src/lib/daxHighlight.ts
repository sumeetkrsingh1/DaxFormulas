import { KWS, FNS } from "./dax-keywords";

const kwRe = new RegExp("\\b(" + KWS.join("|") + ")\\b", "g");
const fnRe = new RegExp("\\b(" + FNS.join("|") + ")\\b", "g");

export function hl(dax: string): string {
  let r = dax.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  r = r.replace(/\/\/[^\r\n]*/g, (m) => '<span class="cm">' + m + "</span>");
  r = r.replace(/"([^"]*)"/g, (_m, p: string) => '<span class="str">"' + p + '"</span>');
  r = r.replace(kwRe, '<span class="kw">$1</span>');
  r = r.replace(fnRe, '<span class="fn">$1</span>');
  r = r.replace(
    /([A-Za-z0-9_]+)\[([^\]]+)\]/g,
    '<span class="tbl">$1</span>[<span class="nm">$2</span>]',
  );
  r = r.replace(/(?<![A-Za-z0-9_])\[([^\]]+)\]/g, '[<span class="nm">$1</span>]');
  r = r.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="num">$1</span>');
  return r;
}
