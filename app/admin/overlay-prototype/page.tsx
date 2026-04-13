import {
  OVERLAY_PROTOTYPE_ROOM,
  OVERLAY_PROTOTYPE_SAMPLES,
  OVERLAY_ROOM_VALIDATION_CONTEXTS,
  type OverlayPrototypeSample,
} from "@/lib/overlay/prototype-data";

const room = OVERLAY_PROTOTYPE_ROOM;
const samples = OVERLAY_PROTOTYPE_SAMPLES;
const roomContexts = OVERLAY_ROOM_VALIDATION_CONTEXTS;

function formatCm(value: number) {
  return `${value} cm`;
}

function categoryLabel(category: OverlayPrototypeSample["category"]) {
  return category === "sofa" ? "Sofa Footprint" : "Table Footprint";
}

function getSample(sampleId: string) {
  return samples.find((sample) => sample.id === sampleId) ?? samples[0];
}

export default function OverlayPrototypePage() {
  return (
    <main className="min-h-screen bg-stone-100 px-6 py-8 text-stone-950 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[28px] border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Admin Overlay Prototype
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Bounded Geometry Overlay Prototype
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-stone-700">
                This route uses only the vetted IKEA clean-control subset to
                show occupied-area guidance. It is intentionally not real-image
                insertion, not perspective matching, and not a final placement
                decision.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-700">
              <div className="font-medium text-stone-900">{room.name}</div>
              <div>Room board: {formatCm(room.widthCm)} x {formatCm(room.depthCm)}</div>
              <div>Anchor origin: {room.anchorOrigin}</div>
              <div>Scale meaning: {room.scaleMeaning}</div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[28px] border border-stone-300 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Shared Room Board</h2>
                <p className="text-sm text-stone-600">
                  A simplified room surface with explicit floor-anchor
                  assumptions and category-labeled occupied areas.
                </p>
              </div>
              <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                Honest overlay only
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-stone-300 bg-[linear-gradient(180deg,#f5f5f4_0%,#e7e5e4_55%,#d6d3d1_55%,#c7c2bc_100%)] p-4">
              <svg viewBox="0 0 900 620" className="h-auto w-full">
                <defs>
                  <linearGradient id="floor" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#d6d3d1" />
                    <stop offset="100%" stopColor="#bab2aa" />
                  </linearGradient>
                </defs>

                <rect x="50" y="60" width="800" height="500" rx="28" fill="#f5f5f4" />
                <rect x="50" y="280" width="800" height="280" rx="0" fill="url(#floor)" />
                <line x1="50" y1="280" x2="850" y2="280" stroke="#a8a29e" strokeWidth="4" />
                <line x1="50" y1="60" x2="50" y2="560" stroke="#a8a29e" strokeWidth="4" />
                <line x1="850" y1="60" x2="850" y2="560" stroke="#a8a29e" strokeWidth="4" />

                <text x="76" y="102" fontSize="22" fill="#57534e" fontWeight="600">
                  Room board
                </text>
                <text x="76" y="132" fontSize="16" fill="#78716c">
                  Bottom-left corner = overlay anchor origin
                </text>
                <text x="76" y="156" fontSize="16" fill="#78716c">
                  Prototype meaning = occupied floor area, not inserted furniture
                </text>

                {samples.map((sample) => {
                  const x = 50 + (sample.placement.leftPct / 100) * 800;
                  const y = 280 + (sample.placement.topPct / 100) * 280;
                  const width = (sample.placement.widthPct / 100) * 800;
                  const height = (sample.placement.depthPct / 100) * 280;

                  return (
                    <g key={sample.id}>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        rx={sample.category === "sofa" ? 22 : 14}
                        fill={sample.overlayColor}
                        fillOpacity="0.18"
                        stroke={sample.overlayColor}
                        strokeWidth="5"
                        strokeDasharray={sample.category === "sofa" ? "18 12" : "10 10"}
                      />
                      <text
                        x={x + 16}
                        y={y + 28}
                        fontSize="18"
                        fill={sample.overlayColor}
                        fontWeight="700"
                      >
                        {categoryLabel(sample.category)}
                      </text>
                      <text x={x + 16} y={y + 52} fontSize="15" fill="#292524">
                        {sample.name}
                      </text>
                      <text x={x + 16} y={y + 74} fontSize="14" fill="#57534e">
                        {formatCm(sample.widthCm)} x {formatCm(sample.depthCm)}
                      </text>
                    </g>
                  );
                })}

                <path
                  d="M130 520 L250 520"
                  stroke="#1c1917"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M130 520 L130 470"
                  stroke="#1c1917"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <text x="260" y="526" fontSize="16" fill="#1c1917">
                  anchor axis
                </text>
                <text x="92" y="462" fontSize="16" fill="#1c1917">
                  depth
                </text>
              </svg>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-stone-300 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Prototype Contract</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-700">
                <li>
                  Shows anchor assumption, occupied width/depth, category label,
                  and dimension text.
                </li>
                <li>
                  Uses trusted outer-envelope geometry from the vetted IKEA
                  control set only.
                </li>
                <li>
                  Does not claim realistic insertion, perspective correctness,
                  or collision-proof automation.
                </li>
              </ul>
            </section>

            <section className="rounded-[28px] border border-stone-300 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Rows Used</h2>
              <div className="mt-4 space-y-4">
                {samples.map((sample) => (
                  <article
                    key={sample.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-stone-950">{sample.name}</h3>
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                          {sample.productCode} · {sample.category}
                        </p>
                      </div>
                      <div
                        className="h-4 w-4 rounded-full border border-stone-300"
                        style={{ backgroundColor: sample.overlayColor }}
                      />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-stone-700">
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          Width
                        </dt>
                        <dd>{formatCm(sample.widthCm)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          Depth
                        </dt>
                        <dd>{formatCm(sample.depthCm)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          Height
                        </dt>
                        <dd>{formatCm(sample.heightCm)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          Anchor
                        </dt>
                        <dd>{sample.anchorLabel}</dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-sm leading-6 text-stone-600">
                      {sample.notes}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-amber-300 bg-amber-50 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-amber-950">Limits</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-900">
                <li>Scale is approximate and based on one room-board assumption.</li>
                <li>Placement origin is manual and category-biased, not automated.</li>
                <li>The overlay means occupied area and rough clearance guidance only.</li>
                <li>
                  It does not mean true perspective match, final fit guarantee,
                  or insertion-ready output.
                </li>
              </ul>
            </section>
          </div>
        </section>

        <section className="rounded-[28px] border border-stone-300 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Real Room Validation</h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-stone-600">
                These cards place the same bounded overlay idea on top of two
                real room-image contexts from persisted <code>spaces</code>{" "}
                rows. The overlay is deliberately a floor-use hint only, not a
                camera-accurate insertion.
              </p>
            </div>
            <div className="rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-700">
              Continue only if this improves fit comprehension without creating
              fake certainty.
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            {roomContexts.map((context) => {
              const sample = getSample(context.sampleId);

              return (
                <article
                  key={context.id}
                  className="overflow-hidden rounded-[24px] border border-stone-300 bg-stone-50"
                >
                  <div className="grid gap-4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-stone-950">
                          {context.name}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                          {context.contextLabel}
                        </p>
                      </div>
                      <div
                        className="rounded-full border px-3 py-1 text-xs font-medium"
                        style={{
                          borderColor: sample.overlayColor,
                          color: sample.overlayColor,
                          backgroundColor: `${sample.overlayColor}14`,
                        }}
                      >
                        {sample.name}
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[20px] border border-stone-300 bg-stone-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={context.imageUrl}
                        alt={context.name}
                        className="h-[320px] w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                      <div
                        className="pointer-events-none absolute bottom-[9%] rounded-[18px] border-4"
                        style={{
                          left: `${context.overlayPlacement.leftPct}%`,
                          width: `${context.overlayPlacement.widthPct}%`,
                          height: `${context.overlayPlacement.floorBandPct}%`,
                          borderColor: sample.overlayColor,
                          backgroundColor: `${sample.overlayColor}30`,
                        }}
                      />
                      <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white/88 px-3 py-2 text-xs leading-5 text-stone-800 shadow-sm">
                        <div className="font-semibold">Overlay meaning</div>
                        <div>Occupied floor area only</div>
                        <div>Anchor = manually chosen floor band</div>
                        <div>Not perspective-correct placement</div>
                      </div>
                      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-black/70 px-3 py-2 text-xs leading-5 text-white shadow-sm">
                        <div className="font-semibold">{categoryLabel(sample.category)}</div>
                        <div>
                          {formatCm(sample.widthCm)} x {formatCm(sample.depthCm)}
                        </div>
                      </div>
                    </div>

                    <dl className="grid grid-cols-3 gap-3 text-sm text-stone-700">
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          Brightness
                        </dt>
                        <dd>{context.brightnessScore}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          Minimalism
                        </dt>
                        <dd>{context.minimalismScore}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          Density
                        </dt>
                        <dd>{context.spatialDensityScore}</dd>
                      </div>
                    </dl>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                          Likely understood
                        </div>
                        <p className="mt-2 text-sm leading-6 text-emerald-950">
                          {context.whatUsersLikelyUnderstand}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                          Misleading risk
                        </div>
                        <p className="mt-2 text-sm leading-6 text-amber-950">
                          {context.misleadingRisk}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
