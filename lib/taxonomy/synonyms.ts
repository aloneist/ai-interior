import type {
  CanonicalCategory,
  CanonicalSubcategory,
  CanonicalMaterial,
  CanonicalColorFamily,
} from "./types";

export const CATEGORY_SYNONYMS: Record<string, CanonicalCategory> = {
  sofa: "sofa",
  couch: "sofa",
  loveseat: "sofa",
  sectional: "sofa",
  "corner sofa": "sofa",
  "sofa bed": "sofa",
  "modular sofa": "sofa",
  "reclining sofa": "sofa",
  소파: "sofa",
  카우치: "sofa",
  "카우치 소파": "sofa",
  "코너 소파": "sofa",
  "모듈형 소파": "sofa",
  "소파 베드": "sofa",
  소파베드: "sofa",
  "1인용 소파": "sofa",
  "2인용 소파": "sofa",
  "3인용 소파": "sofa",
  "4인용 소파": "sofa",
  "1인용소파": "sofa",
  "2인용소파": "sofa",
  "3인용소파": "sofa",
  "4인용소파": "sofa",

  chair: "chair",
  armchair: "chair",
  "accent chair": "chair",
  "dining chair": "chair",
  "office chair": "chair",
  stool: "chair",
  bench: "chair",
  의자: "chair",
  암체어: "chair",
  "식탁 의자": "chair",
  식탁의자: "chair",
  "사무용 의자": "chair",
  "책상 의자": "chair",
  스툴: "chair",
  벤치: "chair",

  table: "table",
  "coffee table": "table",
  "side table": "table",
  "dining table": "table",
  테이블: "table",
  식탁: "table",
  "커피 테이블": "table",
  커피테이블: "table",
  "사이드 테이블": "table",
  사이드테이블: "table",

  desk: "desk",
  책상: "desk",

  storage: "storage",
  cabinet: "storage",
  bookshelf: "storage",
  drawer: "storage",
  wardrobe: "storage",
  수납: "storage",
  수납장: "storage",
  캐비닛: "storage",
  책장: "storage",
  서랍장: "storage",
  옷장: "storage",

  bed: "bed",
  mattress: "bed",
  침대: "bed",
  매트리스: "bed",

  lighting: "lighting",
  lamp: "lighting",
  light: "lighting",
  조명: "lighting",
  램프: "lighting",

  decor: "decor",
  mirror: "decor",
  거울: "decor",
  데코: "decor",

  textile: "textile",
  rug: "textile",
  curtain: "textile",
  cushion: "textile",
  러그: "textile",
  커튼: "textile",
  쿠션: "textile",
};

export const SUBCATEGORY_SYNONYMS: Record<string, CanonicalSubcategory> = {
  sectional: "sectional_sofa",
  "sectional sofa": "sectional_sofa",
  "corner sofa": "sectional_sofa",
  "섹셔널 소파": "sectional_sofa",
  "코너 소파": "sectional_sofa",

  loveseat: "loveseat",
  러브시트: "loveseat",

  "sofa bed": "sofa_bed",
  소파베드: "sofa_bed",
  "소파 베드": "sofa_bed",

  "reclining sofa": "recliner_sofa",
  "리클라이너 소파": "recliner_sofa",

  "modular sofa": "modular_sofa",
  "모듈형 소파": "modular_sofa",

  "accent chair": "accent_chair",
  "포인트 체어": "accent_chair",

  armchair: "armchair",
  암체어: "armchair",

  "dining chair": "dining_chair",
  "식탁 의자": "dining_chair",
  식탁의자: "dining_chair",

  "office chair": "office_chair",
  "사무용 의자": "office_chair",

  stool: "stool",
  스툴: "stool",

  bench: "bench",
  벤치: "bench",

  "coffee table": "coffee_table",
  "커피 테이블": "coffee_table",
  커피테이블: "coffee_table",

  "side table": "side_table",
  "사이드 테이블": "side_table",
  사이드테이블: "side_table",

  "dining table": "dining_table",
  식탁: "dining_table",

  "console table": "console_table",
  "콘솔 테이블": "console_table",

  "tv stand": "tv_stand",
  TV장: "tv_stand",
  tv장: "tv_stand",

  cabinet: "cabinet",
  캐비닛: "cabinet",

  bookshelf: "bookshelf",
  책장: "bookshelf",

  drawer: "drawer",
  서랍장: "drawer",

  wardrobe: "wardrobe",
  옷장: "wardrobe",

  "bed frame": "bed_frame",
  "침대 프레임": "bed_frame",

  mattress: "mattress",
  매트리스: "mattress",

  "floor lamp": "floor_lamp",
  "플로어 램프": "floor_lamp",

  "table lamp": "table_lamp",
  "테이블 램프": "table_lamp",

  "pendant light": "pendant_light",
  "펜던트 조명": "pendant_light",

  "wall light": "wall_light",
  "벽 조명": "wall_light",

  mirror: "mirror",
  거울: "mirror",

  rug: "rug",
  러그: "rug",

  curtain: "curtain",
  커튼: "curtain",

  cushion: "cushion",
  쿠션: "cushion",
};

export const MATERIAL_SYNONYMS: Record<string, CanonicalMaterial> = {
  fabric: "fabric",
  textile: "fabric",
  패브릭: "fabric",
  직물: "fabric",
  천: "fabric",
  천소재: "fabric",

  leather: "leather",
  가죽: "leather",
  천연가죽: "leather",

  "faux leather": "faux_leather",
  "pu leather": "faux_leather",
  인조가죽: "faux_leather",
  합성가죽: "faux_leather",

  wood: "wood",
  solidwood: "wood",
  "solid wood": "wood",
  원목: "wood",

  "engineered wood": "engineered_wood",
  mdf: "engineered_wood",
  pb: "engineered_wood",
  합판: "engineered_wood",
  가공목: "engineered_wood",

  metal: "metal",
  steel: "metal",
  iron: "metal",
  aluminum: "metal",
  금속: "metal",
  철제: "metal",
  스틸: "metal",
  알루미늄: "metal",

  glass: "glass",
  유리: "glass",

  stone: "stone",
  석재: "stone",

  marble: "marble",
  대리석: "marble",

  plastic: "plastic",
  플라스틱: "plastic",

  rattan: "rattan",
  라탄: "rattan",

  bamboo: "bamboo",
  대나무: "bamboo",

  linen: "linen",
  리넨: "linen",

  cotton: "cotton",
  코튼: "cotton",
  면: "cotton",

  velvet: "velvet",
  벨벳: "velvet",

  boucle: "boucle",
  부클: "boucle",

  wool: "wool",
  울: "wool",

  foam: "foam",
  폼: "foam",
  우레탄폼: "foam",

  ceramic: "ceramic",
  세라믹: "ceramic",
};

export const COLOR_FAMILY_SYNONYMS: Record<string, CanonicalColorFamily> = {
  white: "white",
  ivory: "white",
  화이트: "white",
  아이보리: "white",
  오프화이트: "white",

  black: "black",
  블랙: "black",

  gray: "gray",
  grey: "gray",
  grayish: "gray",
  그레이: "gray",
  anthracite: "gray",
  앤트러싸이트: "gray",
  charcoal: "gray",
  차콜: "gray",

  beige: "beige",
  베이지: "beige",
  taupe: "beige",
  토프: "beige",

  brown: "brown",
  walnut: "brown",
  oakbrown: "brown",
  브라운: "brown",
  월넛: "brown",

  cream: "cream",
  크림: "cream",

  green: "green",
  sage: "green",
  olive: "green",
  그린: "green",
  세이지: "green",
  올리브: "green",

  blue: "blue",
  skyblue: "blue",
  블루: "blue",

  navy: "navy",
  네이비: "navy",

  yellow: "yellow",
  mustard: "yellow",
  옐로우: "yellow",
  머스타드: "yellow",

  orange: "orange",
  오렌지: "orange",

  red: "red",
  burgundy: "red",
  레드: "red",
  버건디: "red",

  pink: "pink",
  핑크: "pink",

  purple: "purple",
  퍼플: "purple",

  silver: "silver",
  실버: "silver",

  gold: "gold",
  골드: "gold",

  transparent: "transparent",
  clear: "transparent",
  투명: "transparent",
};