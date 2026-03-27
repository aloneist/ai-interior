import type {
  CanonicalCategory,
  CanonicalSubcategory,
  CanonicalMaterial,
  CanonicalColorFamily,
  CanonicalStyleTag,
  CanonicalShape,
  CanonicalRoomType,
} from "./types";

export const CATEGORY_DISPLAY_KO: Record<CanonicalCategory, string> = {
  sofa: "소파",
  chair: "의자",
  table: "테이블",
  desk: "책상",
  storage: "수납가구",
  bed: "침대",
  lighting: "조명",
  decor: "데코",
  textile: "패브릭/텍스타일",
};

export const SUBCATEGORY_DISPLAY_KO: Record<CanonicalSubcategory, string> = {
  sectional_sofa: "섹셔널 소파",
  loveseat: "러브시트",
  sofa_bed: "소파베드",
  recliner_sofa: "리클라이너 소파",
  modular_sofa: "모듈형 소파",

  accent_chair: "포인트 체어",
  armchair: "암체어",
  dining_chair: "식탁 의자",
  office_chair: "사무용 의자",
  stool: "스툴",
  bench: "벤치",

  coffee_table: "커피 테이블",
  side_table: "사이드 테이블",
  dining_table: "식탁",
  console_table: "콘솔 테이블",

  tv_stand: "TV장",
  cabinet: "캐비닛",
  bookshelf: "책장",
  drawer: "서랍장",
  wardrobe: "옷장",

  bed_frame: "침대 프레임",
  mattress: "매트리스",

  floor_lamp: "플로어 램프",
  table_lamp: "테이블 램프",
  pendant_light: "펜던트 조명",
  wall_light: "벽 조명",

  mirror: "거울",
  rug: "러그",
  curtain: "커튼",
  cushion: "쿠션",
};

export const MATERIAL_DISPLAY_KO: Record<CanonicalMaterial, string> = {
  fabric: "패브릭",
  leather: "가죽",
  faux_leather: "인조가죽",
  wood: "원목",
  engineered_wood: "가공목/엔지니어드 우드",
  metal: "금속",
  glass: "유리",
  stone: "석재",
  marble: "대리석",
  plastic: "플라스틱",
  rattan: "라탄",
  bamboo: "대나무",
  linen: "리넨",
  cotton: "코튼",
  velvet: "벨벳",
  boucle: "부클",
  wool: "울",
  foam: "폼",
  ceramic: "세라믹",
};

export const COLOR_FAMILY_DISPLAY_KO: Record<CanonicalColorFamily, string> = {
  white: "화이트",
  black: "블랙",
  gray: "그레이",
  beige: "베이지",
  brown: "브라운",
  cream: "크림",
  green: "그린",
  blue: "블루",
  navy: "네이비",
  yellow: "옐로우",
  orange: "오렌지",
  red: "레드",
  pink: "핑크",
  purple: "퍼플",
  silver: "실버",
  gold: "골드",
  transparent: "투명",
  multicolor: "멀티컬러",
};

export const STYLE_TAG_DISPLAY_KO: Record<CanonicalStyleTag, string> = {
  modern: "모던",
  minimal: "미니멀",
  scandinavian: "북유럽",
  mid_century_modern: "미드센추리 모던",
  industrial: "인더스트리얼",
  natural: "내추럴",
  classic: "클래식",
  contemporary: "컨템포러리",
  rustic: "러스틱",
  luxury: "럭셔리",
  soft_modern: "소프트 모던",
  japandi: "재팬디",
  bohemian: "보헤미안",
};

export const SHAPE_DISPLAY_KO: Record<CanonicalShape, string> = {
  round: "원형",
  oval: "타원형",
  square: "정사각형",
  rectangular: "직사각형",
  curved: "곡선형",
  linear: "직선형",
  l_shaped: "ㄱ자형",
  u_shaped: "U자형",
};

export const ROOM_TYPE_DISPLAY_KO: Record<CanonicalRoomType, string> = {
  living_room: "거실",
  bedroom: "침실",
  dining_room: "다이닝",
  home_office: "홈오피스",
  entryway: "현관",
  kids_room: "아이방",
  outdoor: "야외",
};