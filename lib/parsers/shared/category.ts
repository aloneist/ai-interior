export function normalizeCategory(value: string): string | null {
  const text = value.toLowerCase().replace(/\s+/g, " ").trim();

  if (
    text.includes("sofa") ||
    text.includes("소파") ||
    text.includes("2인용 소파") ||
    text.includes("3인용 소파") ||
    text.includes("1인용 소파") ||
    text.includes("4인용 소파") ||
    text.includes("소파베드") ||
    text.includes("코너 소파") ||
    text.includes("카우치 소파") ||
    text.includes("모듈형 소파")
  ) {
    return "sofa";
  }

  if (
    text.includes("chair") ||
    text.includes("의자") ||
    text.includes("암체어") ||
    text.includes("식탁의자") ||
    text.includes("라운지체어")
  ) {
    return "chair";
  }

  if (
    text.includes("table") ||
    text.includes("테이블") ||
    text.includes("식탁") ||
    text.includes("커피테이블") ||
    text.includes("사이드테이블")
  ) {
    return "table";
  }

  if (
    text.includes("storage") ||
    text.includes("수납") ||
    text.includes("선반") ||
    text.includes("서랍") ||
    text.includes("수납장") ||
    text.includes("캐비닛")
  ) {
    return "storage";
  }

  if (text.includes("bed") || text.includes("침대")) return "bed";
  if (text.includes("lamp") || text.includes("조명")) return "lighting";
  if (text.includes("desk") || text.includes("책상")) return "desk";
  if (text.includes("decor") || text.includes("장식")) return "decor";

  return null;
}