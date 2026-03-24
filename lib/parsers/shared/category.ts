export type FurnitureCategory =
  | "sofa"
  | "chair"
  | "table"
  | "storage"
  | "bed"
  | "lighting"
  | "desk"
  | "decor";

function hasAny(text: string, keywords: string[]) {
  return keywords.some((kw) => text.includes(kw));
}

export function normalizeCategory(input?: string | null): FurnitureCategory | null {
  if (!input) return null;

  const text = input.toLowerCase().replace(/\s+/g, " ").trim();

  const sofaKeywords = [
  "sofa",
  "couch",
  "2-seat sofa",
  "3-seat sofa",
  "4-seat sofa",
  "2 seater sofa",
  "3 seater sofa",
  "4 seater sofa",
  "loveseat",
  "chaise longue",
  "sectional",
  "corner sofa",
  "sofa bed",
  "modular sofa",
  "reclining sofa",
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
];

if (hasAny(text, sofaKeywords)) {
  return "sofa";
}

const chairKeywords = [
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
  "어린이스툴",
  "어린이 스툴",
];

if (hasAny(text, chairKeywords)) {
  return "chair";
}

  const tableKeywords = [
    "table",
    "dining table",
    "coffee table",
    "side table",
    "테이블",
    "식탁",
    "커피테이블",
    "커피 테이블",
    "사이드테이블",
    "사이드 테이블",
  ];

  if (hasAny(text, tableKeywords)) {
    return "table";
  }

  const storageKeywords = [
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
  ];

  if (hasAny(text, storageKeywords)) {
    return "storage";
  }

  if (hasAny(text, ["bed", "침대"])) {
    return "bed";
  }

  if (hasAny(text, ["lamp", "lighting", "조명", "램프"])) {
    return "lighting";
  }

  if (hasAny(text, ["desk", "책상"])) {
    return "desk";
  }

  if (hasAny(text, ["decor", "장식"])) {
    return "decor";
  }

  return null;
}