export type Formula = {
  id: number;
  cat: string;
  sub: string;
  diff: string;
  title: string;
  q: string;
  dax: string;
  insight: string;
  tags: string[];
};

export type CatConfig = { ico: string; title: string; desc: string };

export type ModelCol = {
  name: string;
  type: string;
  source: string;
  desc: string;
};

export type ModelTable = {
  table: string;
  emoji: string;
  desc: string;
  note: string;
  usedIn: string[];
  cols: ModelCol[];
};

export type SimData = {
  actual: Record<string, number>;
  ly: Record<string, number>;
  target: Record<string, number>;
  forecast: Record<string, number>;
};
