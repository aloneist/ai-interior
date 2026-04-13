export type OverlayPrototypeSample = {
  id: string;
  productCode: string;
  name: string;
  category: "sofa" | "table";
  widthCm: number;
  depthCm: number;
  heightCm: number;
  anchorLabel: string;
  notes: string;
  overlayColor: string;
  placement: {
    leftPct: number;
    topPct: number;
    widthPct: number;
    depthPct: number;
  };
};

export type OverlayPrototypeRoom = {
  id: string;
  name: string;
  widthCm: number;
  depthCm: number;
  anchorOrigin: string;
  scaleMeaning: string;
};

export type OverlayRoomValidationContext = {
  id: string;
  spaceId: string;
  name: string;
  imageUrl: string;
  contextLabel: string;
  brightnessScore: number;
  minimalismScore: number;
  spatialDensityScore: number;
  sampleId: OverlayPrototypeSample["id"];
  whatUsersLikelyUnderstand: string;
  misleadingRisk: string;
  overlayPlacement: {
    leftPct: number;
    widthPct: number;
    floorBandPct: number;
  };
};

export const OVERLAY_PROTOTYPE_ROOM: OverlayPrototypeRoom = {
  id: "living-control-room-v1",
  name: "IKEA Control Room",
  widthCm: 420,
  depthCm: 340,
  anchorOrigin: "bottom-left floor anchor on a simplified room board",
  scaleMeaning: "plan-view board uses a linear room scale based on room cm values",
};

export const OVERLAY_PROTOTYPE_SAMPLES: OverlayPrototypeSample[] = [
  {
    id: "landskrona-dark-blue",
    productCode: "s99415821",
    name: "LANDSKRONA 3-seat sofa",
    category: "sofa",
    widthCm: 204,
    depthCm: 89,
    heightCm: 78,
    anchorLabel: "left wall anchor, front edge kept clear for circulation",
    notes:
      "Trusted rectangular sofa envelope from the vetted IKEA clean-control set.",
    overlayColor: "#2563eb",
    placement: {
      leftPct: 8,
      topPct: 46,
      widthPct: 48.6,
      depthPct: 26.2,
    },
  },
  {
    id: "mittzon-table",
    productCode: "s29533451",
    name: "MITTZON conference table",
    category: "table",
    widthCm: 140,
    depthCm: 108,
    heightCm: 105,
    anchorLabel: "center-weighted anchor with equal side clearance bias",
    notes:
      "Trusted rectangular table envelope from the vetted IKEA clean-control set.",
    overlayColor: "#ea580c",
    placement: {
      leftPct: 33.3,
      topPct: 28.2,
      widthPct: 33.3,
      depthPct: 31.8,
    },
  },
];

export const OVERLAY_ROOM_VALIDATION_CONTEXTS: OverlayRoomValidationContext[] = [
  {
    id: "space-living-sofa-01",
    spaceId: "5fc530bc-dc40-40ec-a649-fa86bb6c1382",
    name: "Persisted living-room context",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    contextLabel: "real room image from persisted spaces row",
    brightnessScore: 75,
    minimalismScore: 50,
    spatialDensityScore: 40,
    sampleId: "landskrona-dark-blue",
    whatUsersLikelyUnderstand:
      "The sofa would occupy a substantial left-wall span and would reduce open circulation in the front zone.",
    misleadingRisk:
      "The flat footprint can look more camera-accurate than it really is if the legend is ignored.",
    overlayPlacement: {
      leftPct: 8,
      widthPct: 42,
      floorBandPct: 27,
    },
  },
  {
    id: "space-dining-table-01",
    spaceId: "010a62d2-aef3-41c1-8b04-ac6fe78b6920",
    name: "Persisted compact dining/work context",
    imageUrl:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    contextLabel: "real room image from persisted spaces row",
    brightnessScore: 75,
    minimalismScore: 60,
    spatialDensityScore: 40,
    sampleId: "mittzon-table",
    whatUsersLikelyUnderstand:
      "The table footprint is readable as a centered occupied area and helps estimate whether walking space remains around it.",
    misleadingRisk:
      "Without explicit wording, users may overread the footprint as exact tabletop placement in camera perspective.",
    overlayPlacement: {
      leftPct: 34,
      widthPct: 29,
      floorBandPct: 24,
    },
  },
];
