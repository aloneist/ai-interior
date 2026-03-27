export type FurnitureCategory =
  | "sofa"
  | "chair"
  | "table"
  | "storage"
  | "bed"
  | "lighting"
  | "desk"
  | "decor";

export type CategoryScoreBreakdown = {
  category: FurnitureCategory;
  score: number;
  matched_keywords: string[];
};

export type CategoryResolution = {
  category: FurnitureCategory | null;
  scores: CategoryScoreBreakdown[];
  confidence: "high" | "medium" | "low";
};

const CATEGORY_KEYWORDS: Record<FurnitureCategory, string[]> = {
  table: [
    "dining table",
    "coffee table",
    "side table",
    "console table",
    "round table",
    "bedside table",
    "end table",
    "nesting table",
    "drop-leaf table",
    "bar table",
    "bistro table",
    "table",
    "테이블",
    "식탁",
    "원형 테이블",
    "콘솔 테이블",
    "커피테이블",
    "커피 테이블",
    "사이드테이블",
    "사이드 테이블",
    "보조 테이블",
    "침대협탁",
    "협탁",
  ],

  sofa: [
    "2-seat sofa",
    "3-seat sofa",
    "4-seat sofa",
    "2 seater sofa",
    "3 seater sofa",
    "4 seater sofa",
    "corner sofa",
    "modular sofa",
    "reclining sofa",
    "sofa bed",
    "loveseat",
    "sectional",
    "chaise longue",
    "sofa",
    "couch",
    "카우치 소파",
    "카우치",
    "코너 소파",
    "모듈형 소파",
    "리클라이닝 소파",
    "2인용소파",
    "2인용 소파",
    "3인용소파",
    "3인용 소파",
    "4인용소파",
    "4인용 소파",
    "1인용소파",
    "1인용 소파",
    "소파베드",
    "소파 베드",
    "소파",
  ],

  chair: [
    "office chair",
    "desk chair",
    "conference chair",
    "gaming chair",
    "children's desk chair",
    "childrens desk chair",
    "children's chair",
    "childrens chair",
    "armchair",
    "lounge chair",
    "dining chair",
    "stool",
    "bench",
    "children's stool",
    "childrens stool",
    "sit/stand support",
    "active sit/stand support",
    "active sit stand support",
    "chair",
    "액티브 서포트",
    "의자",
    "암체어",
    "라운지체어",
    "라운지 의자",
    "식탁의자",
    "식탁 의자",
    "책상 의자",
    "사무용 의자",
    "회의의자",
    "회의 의자",
    "게이밍 의자",
    "어린이용 의자",
    "어린이 의자",
    "어린이용 책상 의자",
    "스툴",
    "벤치",
    "어린이스툴",
    "어린이 스툴",
  ],

  storage: [
    "storage",
    "cabinet",
    "shelf",
    "drawer",
    "bookcase",
    "수납",
    "선반",
    "서랍",
    "수납장",
    "캐비닛",
    "책장",
  ],

  bed: ["bed", "침대"],

  lighting: ["lamp", "lighting", "조명", "램프"],

  desk: ["desk", "책상"],

  decor: ["decor", "장식"],
};

const CATEGORY_NEGATIVE_KEYWORDS: Partial<Record<FurnitureCategory, string[]>> = {
  table: ["sofa", "소파", "chair", "의자"],
  sofa: ["table", "테이블", "식탁", "chair", "의자", "bench", "벤치"],
  chair: ["table", "테이블", "식탁", "sofa", "소파"],
};

function normalizeCategoryText(input?: string | null) {
  return (input ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function sortKeywordsByLengthDesc(keywords: string[]) {
  return [...keywords].sort((a, b) => b.length - a.length);
}

function scoreSingleCategory(
  text: string,
  category: FurnitureCategory
): CategoryScoreBreakdown {
  const positiveKeywords = sortKeywordsByLengthDesc(CATEGORY_KEYWORDS[category]);
  const negativeKeywords = sortKeywordsByLengthDesc(
    CATEGORY_NEGATIVE_KEYWORDS[category] ?? []
  );

  const matched_keywords: string[] = [];
  let score = 0;

  for (const keyword of positiveKeywords) {
    if (!text.includes(keyword)) continue;
    matched_keywords.push(keyword);

    if (keyword.includes(" ") || keyword.length >= 6) {
      score += 10;
    } else {
      score += 5;
    }
  }

  for (const keyword of negativeKeywords) {
    if (!text.includes(keyword)) continue;
    score -= 4;
  }

  return {
    category,
    score,
    matched_keywords: uniq(matched_keywords),
  };
}

export function resolveCategory(input?: string | null): CategoryResolution {
  const text = normalizeCategoryText(input);

  if (!text) {
    return {
      category: null,
      scores: [],
      confidence: "low",
    };
  }

  const categories: FurnitureCategory[] = [
    "table",
    "sofa",
    "chair",
    "storage",
    "bed",
    "lighting",
    "desk",
    "decor",
  ];

  const scores = categories
    .map((category) => scoreSingleCategory(text, category))
    .sort((a, b) => b.score - a.score);

  const best = scores[0];
  const second = scores[1];

  if (!best || best.score <= 0) {
    return {
      category: null,
      scores,
      confidence: "low",
    };
  }

  const gap = best.score - (second?.score ?? 0);

  return {
    category: best.category,
    scores,
    confidence: gap >= 8 ? "high" : gap >= 4 ? "medium" : "low",
  };
}

export function normalizeCategory(
  input?: string | null
): FurnitureCategory | null {
  return resolveCategory(input).category;
}