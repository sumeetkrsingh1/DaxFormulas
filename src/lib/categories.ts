export const CAT = {
  all:            {ico:"⚡", title:"All Formulas",         desc:"Complete library — all 380 measures across all domains and departments."},
  time:           {ico:"📅", title:"Time Intelligence",    desc:"62 formulas with [KPI] prefix. Replace [KPI] with Revenue, Cost, Headcount, Units etc. using Find & Replace after generating the DAX script. MTD/QTD/YTD, rolling windows, growth %, weekday/weekend, forecasting and more."},
  generic:        {ico:"🔢", title:"Generic Measures",     desc:"Foundation measures every Power BI file needs regardless of industry. Includes base aggregations (Sales, Cost, Stock), counting measures (Customers, Products, Salesmen), and key ratios (AOV, Avg Sales per Customer/Product/Rep)."},
  sales:          {ico:"💰", title:"Sales",                desc:"19 measures: Target & Achievement, Pipeline Coverage, Win Rate, Rep Performance, Revenue Quality (new vs renewal, upsell, discount rate)."},
  finance:        {ico:"🏦", title:"Finance",              desc:"57 measures: P&L (Revenue, COGS, Gross Profit, Opex, EBITDA, EBIT, EBT, Net Profit), Contribution Margin, AR (DSO, ageing, bad debt), AP (DPO, CCC), Financial Ratios."},
  marketing:      {ico:"📣", title:"Marketing",            desc:"20 measures: Campaign Performance (spend, CPA, ROAS, ROI), Lead Generation (volume, conversion, pipeline created), Digital (CTR, CPM, CPC, bounce rate), Customer Acquisition (CAC, LTV:CAC), Brand & Retention."},
  hr:             {ico:"👤", title:"Human Resources",      desc:"54 measures: Headcount (point-in-time), Attrition & Retention, Recruitment (time-to-fill, cost-per-hire), Payroll & Salaries, Leave & Absence (Bradford Factor), HR Efficiency."},
  operations:     {ico:"⚙️", title:"Operations",           desc:"20 measures: OEE, Quality (FPY, PPM, COPQ), Reliability (MTBF, MTTR), Delivery (OTD, OTIF, Fill Rate), Production vs Plan."},
  inventory:      {ico:"🏭", title:"Inventory",            desc:"24 measures: Stock positions, Sales velocity (30D/90D/12M), Days/Months of stock, GMROI, Slow-movers, Dead stock, Expiry alerts, Shrinkage."},
  customerservice:{ico:"🎧", title:"Customer Service",     desc:"24 measures: Ticket volumes, Resolution rate, SLA compliance, AHT, CSAT, FCR, Agent performance, Backlog, Channel mix."},
  customer:       {ico:"👥", title:"Customer Analysis",    desc:"26 measures: Active customers, YoY set analysis (Retained, New, Lost using INTERSECT/EXCEPT), Retention %, Churn %, Lost Revenue £, Top customers, LTV."},
  product:        {ico:"📦", title:"Product Analysis",     desc:"26 measures: Products sold TY vs LY, Common products (both years), New products (TY not LY), Dropped (LY not TY), Top 5 this year & last year, Margin, Returns."},
  datamodel:      {ico:"📐", title:"Data Model Reference",      desc:"31 tables · 263 columns across all formula categories. Every table and column referenced in the formulas — plus recommended extras clearly marked. Use this as your Power BI model blueprint so formulas work with zero changes."},
  topbottom:      {ico:"🏆", title:"Top & Bottom",           desc:"12 measures: Best & worst salesman, customer, and product by total sales — Name only and Name | Sales (with comma-formatted values). Fully slicer-responsive. Generic variable names for easy copy-paste."},
  dynamic:        {ico:"🔀", title:"Dynamic Comparison",   desc:"18 measures: Period Switcher (MTD/QTD/YTD/Full), Reference Switcher (LY/Target/Forecast), Variance £ & %, RAG Status, Remaining Gap, Always-On growth rates."}
};
export const GROUPS = [
  {label:"Quick Start",    items:["all"]},
  {label:"Core",           items:["generic","time"]},
  {label:"Departments",    items:["sales","finance","marketing","hr","operations","inventory","customerservice"]},
  {label:"Analysis",       items:["customer","product","topbottom","dynamic"]},
  {label:"📐 Data Model",  items:["datamodel"]}
];
