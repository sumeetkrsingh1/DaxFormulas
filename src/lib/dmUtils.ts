export const DM_CAT_MAP: Record<string, string> = {
  time: "📅 Time",
  finance: "🏦 Finance",
  hr: "👤 HR",
  sales: "💰 Sales",
  operations: "⚙️ Ops",
  inventory: "🏭 Inventory",
  customerservice: "🎧 CS",
  dynamic: "🔀 Dynamic",
  marketing: "📣 Marketing",
  customer: "👥 Customer",
  product: "📦 Product",
  generic: "🔢 Generic",
  topbottom: "🏆 Top/Bottom",
};

export function typeBadgeClass(t: string): string {
  const map: Record<string, string> = {
    Date: "type-date",
    Text: "type-text",
    Integer: "type-integer",
    Decimal: "type-decimal",
    Currency: "type-currency",
    Boolean: "type-boolean",
  };
  return "type-badge " + (map[t] || "type-text");
}
