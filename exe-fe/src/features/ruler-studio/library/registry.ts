export const categories = [
  "All",
  "Straight",
  "Geometry",
  "Drafting",
  "Scale",
  "Architecture",
  "Engineering",
  "Curves",
  "Sewing & Fashion",
  "Craft & Cutting",
  "School",
  "Measuring",
  "Specialty",
] as const;
export type RulerCategory = Exclude<(typeof categories)[number], "All">;
export type MeasurementSystem = "metric" | "imperial" | "dual";
export type RulerSurface = "ruler" | "back" | "face-a" | "face-b" | "face-c";
export type GeometryFamily =
  | "straight"
  | "set-square"
  | "t-square"
  | "flat-scale"
  | "triangular-scale"
  | "french-curve"
  | "hip-curve"
  | "l-square"
  | "protractor"
  | "stencil";
export type MarkingSystem =
  | "standard"
  | "center-zero"
  | "reverse"
  | "scale"
  | "grid"
  | "angle"
  | "large-print"
  | "fraction"
  | "reference";
export interface CustomizableRegion {
  id: RulerSurface;
  label: string;
  supportsDrawing: boolean;
  supportsSticker: boolean;
  supportsText: boolean;
}
export interface RulerDefinition {
  id: string;
  name: string;
  vietnameseName: string;
  aliases: string[];
  category: RulerCategory;
  tags: string[];
  description: string;
  useCases: string[];
  measurementSystems: MeasurementSystem[];
  defaultDimensions: { length: number; width: number; thickness: number };
  supportedLengths: number[];
  geometryType: GeometryFamily;
  variant: number;
  markingSystem: MarkingSystem;
  scaleIds: string[];
  reference?: string;
  customizableRegions: CustomizableRegion[];
  supportsNameTag: boolean;
  supportsSticker: boolean;
  supportsDrawing: boolean;
  supportsText: boolean;
  supportsEngraving: boolean;
  supportedMaterials: ("PLA" | "PETG")[];
  availability: "designable" | "coming-later";
  limitation?: string;
}
export const defaultRulerId = "straight-ruler";
export const scaleDefinitions = [
  1, 20, 25, 50, 75, 100, 125, 200, 250, 500,
].map((ratio) => ({ id: `1:${ratio}`, label: `1:${ratio}`, ratio }));
export const region = (
  id: RulerSurface,
  label: string,
): CustomizableRegion => ({
  id,
  label,
  supportsDrawing: true,
  supportsSticker: true,
  supportsText: true,
});
const fronts = [region("ruler", "Front"), region("back", "Back")];
type Extras = Partial<
  Omit<
    RulerDefinition,
    "id" | "name" | "vietnameseName" | "category" | "geometryType"
  >
>;
function ruler(
  id: string,
  name: string,
  vi: string,
  category: RulerCategory,
  geometryType: GeometryFamily = "straight",
  extra: Extras = {},
): RulerDefinition {
  const prism = geometryType === "triangular-scale";
  return {
    id,
    name,
    vietnameseName: vi,
    category,
    geometryType,
    aliases: [],
    tags: [category],
    description: `${name} for ${category.toLowerCase()} projects.`,
    useCases: [category],
    measurementSystems: ["metric"],
    defaultDimensions: { length: 200, width: 35, thickness: 4 },
    supportedLengths: [150, 200, 300],
    variant: 0,
    markingSystem: "standard",
    scaleIds: [],
    customizableRegions: prism
      ? [
          region("face-a", "Face A"),
          region("face-b", "Face B"),
          region("face-c", "Face C"),
        ]
      : fronts,
    supportsSticker: true,
    supportsDrawing: true,
    supportsText: true,
    supportsEngraving: false,
    supportedMaterials: ["PLA", "PETG"],
    availability: "designable",
    ...extra,
    supportsNameTag:
      ["straight", "flat-scale"].includes(geometryType) &&
      (extra.defaultDimensions?.width ?? 35) >= 32 &&
      extra.supportsNameTag !== false,
  };
}
const scales = scaleDefinitions.filter((s) => s.ratio !== 1).map((s) => s.id);
const scaleOptions: Extras = {
  markingSystem: "scale",
  scaleIds: scales,
  tags: ["Scale", "Architecture", "Engineering"],
  aliases: ["thước tỷ lệ", "thuoc ti le", "scale ruler"],
  description:
    "Choose a printed metric scale. Labels show represented metres, not physical centimetres.",
};
const sewing: Extras = {
  tags: ["Sewing & Fashion", "Curves"],
  useCases: [
    "sewing",
    "tailoring",
    "pattern making",
    "may mặc",
    "thiết kế rập",
  ],
  description: "A rigid printable guide for tracing garment patterns.",
};
const future = (limitation: string): Extras => ({
  availability: "coming-later",
  supportedMaterials: [],
  limitation,
});
export const rulerRegistry: RulerDefinition[] = [
  ruler(
    defaultRulerId,
    "Classic Straight Ruler",
    "Thước thẳng",
    "Straight",
    "straight",
    {
      aliases: ["straight ruler", "thuoc thang", "left to right ruler"],
      supportedLengths: [100, 150, 200, 300, 500, 1000],
      tags: ["Straight", "School", "Measuring"],
      description:
        "The familiar everyday ruler, with a protected millimetre scale.",
    },
  ),
  ruler(
    "school-ruler",
    "School Ruler",
    "Thước học sinh",
    "School",
    "straight",
    {
      tags: ["Straight", "School"],
      aliases: ["student ruler", "thước học tập"],
    },
  ),
  ruler(
    "set-square-45",
    "45° Set Square",
    "Thước ê-ke 45°",
    "Geometry",
    "set-square",
    {
      variant: 45,
      aliases: [
        "45 degree set square",
        "triangle ruler",
        "thước tam giác",
        "eke",
        "e ke",
      ],
      tags: ["Geometry", "School", "Engineering"],
      description: "A true 45° / 45° / 90° triangle with an open centre.",
    },
  ),
  ruler(
    "set-square-30-60",
    "30° / 60° Set Square",
    "Thước ê-ke 30° 60°",
    "Geometry",
    "set-square",
    {
      variant: 30,
      aliases: ["30 60 set square", "triangle ruler", "thước tam giác", "eke"],
      tags: ["Geometry", "School", "Engineering"],
      description: "A true 30° / 60° / 90° triangle with an open centre.",
    },
  ),
  ruler("t-square", "T-Square", "Thước chữ T", "Drafting", "t-square", {
    aliases: ["T square", "tsquare", "thước T"],
    supportedLengths: [200, 300, 500, 600],
    tags: ["Drafting", "Architecture", "Engineering"],
    description: "A straight drafting blade and perpendicular T-head.",
  }),
  ruler(
    "architect-scale",
    "Architect Scale",
    "Thước tỷ lệ kiến trúc",
    "Architecture",
    "flat-scale",
    {
      ...scaleOptions,
      aliases: [...scaleOptions.aliases!, "architectural scale"],
      useCases: ["architect", "architecture", "kiến trúc"],
    },
  ),
  ruler(
    "engineer-scale",
    "Engineer Scale",
    "Thước tỷ lệ kỹ thuật",
    "Engineering",
    "flat-scale",
    {
      ...scaleOptions,
      aliases: [...scaleOptions.aliases!, "engineering scale"],
      useCases: ["engineering", "technical drawing", "kỹ thuật"],
    },
  ),
  ruler(
    "triangular-scale",
    "Triangular Scale Ruler",
    "Thước tỷ lệ tam giác",
    "Scale",
    "triangular-scale",
    {
      ...scaleOptions,
      aliases: [
        "triangular architect scale",
        "triangular scale",
        "thước tỷ lệ tam giác",
      ],
      description:
        "An equilateral triangular prism with three independently editable faces.",
    },
  ),
  ruler(
    "french-curve-a",
    "French Curve A",
    "Thước cong Pháp A",
    "Curves",
    "french-curve",
    {
      ...sewing,
      variant: 0,
      aliases: ["french curve", "curve ruler", "thước cong"],
      supportedLengths: [150, 200, 300],
      description:
        "A sweeping S-shaped French curve for drawing smooth transitions.",
    },
  ),
  ruler(
    "flexible-curve",
    "Flexible Curve",
    "Thước cong mềm",
    "Curves",
    "hip-curve",
    {
      ...sewing,
      aliases: ["flexible ruler", "flexible curve ruler"],
      ...future(
        "Requires a flexible material. PLA/PETG versions are not offered as flexible rulers.",
      ),
    },
  ),
  ruler(
    "pattern-ruler",
    "Pattern Making Ruler",
    "Thước thiết kế rập",
    "Sewing & Fashion",
    "hip-curve",
    { ...sewing, aliases: ["pattern ruler", "thước may", "sewing ruler"] },
  ),
  ruler(
    "long-straightedge",
    "Long Straightedge",
    "Thước thẳng dài",
    "Straight",
    "straight",
    {
      supportedLengths: [300, 500, 600, 1000],
      defaultDimensions: { length: 500, width: 40, thickness: 5 },
      aliases: ["straightedge"],
      tags: ["Straight", "Drafting"],
    },
  ),
  ruler(
    "precision-ruler",
    "Metal-Style Precision Ruler",
    "Thước kỹ thuật",
    "Engineering",
    "straight",
    {
      aliases: ["steel ruler", "precision ruler", "metal ruler"],
      description:
        "A precision-ruler silhouette printed in PLA or PETG; this is not steel.",
    },
  ),
  ruler(
    "adjustable-set-square",
    "Fixed-Angle Set Square",
    "Thước ê-ke điều chỉnh góc",
    "Geometry",
    "set-square",
    {
      variant: 60,
      aliases: ["adjustable triangle", "adjustable set square"],
      description:
        "Select a fixed 30°, 45° or 60° angle for the printed guide. No moving hinge.",
    },
  ),
  ruler(
    "protractor",
    "Protractor Ruler",
    "Thước đo góc",
    "Geometry",
    "protractor",
    {
      markingSystem: "angle",
      aliases: ["protractor", "angle ruler"],
      description: "A semicircular 0–180° protractor with radial degree ticks.",
    },
  ),
  ruler(
    "ruler-protractor",
    "Combination Ruler + Protractor",
    "Thước thẳng kết hợp đo góc",
    "Geometry",
    "protractor",
    {
      markingSystem: "angle",
      variant: 1,
      aliases: ["ruler protractor", "combination ruler"],
    },
  ),
  ruler(
    "geometric-shape",
    "Geometric Shape Ruler",
    "Thước hình học",
    "Geometry",
    "stencil",
    {
      aliases: ["geometry ruler", "polygon ruler"],
      tags: ["Geometry", "School"],
    },
  ),
  ruler(
    "mini-t-square",
    "Mini T-Square",
    "Thước chữ T nhỏ",
    "Drafting",
    "t-square",
    {
      supportedLengths: [100, 150, 200],
      defaultDimensions: { length: 150, width: 25, thickness: 3 },
    },
  ),
  ruler(
    "parallel-ruler",
    "Parallel Ruler",
    "Thước song song",
    "Drafting",
    "straight",
    {
      ...future(
        "Linked parallel arms require a tested mechanical assembly. Catalog preview only.",
      ),
    },
  ),
  ruler(
    "rolling-ruler",
    "Rolling Parallel Ruler",
    "Thước lăn",
    "Drafting",
    "straight",
    {
      aliases: ["rolling ruler"],
      ...future(
        "Rollers and bearings are not supported by the current production setup.",
      ),
    },
  ),
  ruler(
    "drafting-straightedge",
    "Drafting Straightedge",
    "Thước vẽ kỹ thuật",
    "Drafting",
    "straight",
    {
      aliases: ["drafting ruler", "technical drawing ruler"],
      tags: ["Architecture", "Engineering", "Drafting"],
    },
  ),
  ruler(
    "metric-scale",
    "Metric Scale Ruler",
    "Thước tỷ lệ hệ mét",
    "Scale",
    "flat-scale",
    scaleOptions,
  ),
  ruler(
    "flat-scale",
    "Flat Scale Ruler",
    "Thước tỷ lệ phẳng",
    "Scale",
    "flat-scale",
    scaleOptions,
  ),
  ruler(
    "architectural-drafting",
    "Architectural Drafting Ruler",
    "Thước vẽ kiến trúc",
    "Architecture",
    "flat-scale",
    { ...scaleOptions, reference: "ARCHITECTURE · PLAN / SECTION / ELEVATION" },
  ),
  ruler(
    "engineering-drafting",
    "Engineering Drafting Ruler",
    "Thước vẽ công trình",
    "Engineering",
    "flat-scale",
    { ...scaleOptions, reference: "ENGINEERING · mm / m" },
  ),
  ruler(
    "blueprint-scale",
    "Blueprint Scale Ruler",
    "Thước tỷ lệ bản vẽ",
    "Architecture",
    "flat-scale",
    { ...scaleOptions, reference: "BLUEPRINT · VERIFY DRAWING SCALE" },
  ),
  ruler(
    "cad-reference",
    "CAD Reference Ruler",
    "Thước tham chiếu CAD",
    "Engineering",
    "straight",
    { markingSystem: "reference", reference: "CAD · X / Y / Z · UNITS: mm" },
  ),
  ruler(
    "mechanical-drawing",
    "Mechanical Drawing Ruler",
    "Thước vẽ cơ khí",
    "Engineering",
    "straight",
    {
      markingSystem: "reference",
      reference: "MECHANICAL · Ø DIAMETER · R RADIUS",
    },
  ),
  ruler(
    "electronics-reference",
    "Electronics Reference Ruler",
    "Thước tham chiếu điện tử",
    "Engineering",
    "straight",
    {
      aliases: ["electrical ruler", "electronics ruler"],
      markingSystem: "reference",
      reference: "ELECTRONICS · V = I × R · P = V × I",
    },
  ),
  ruler(
    "french-curve-b",
    "French Curve B",
    "Thước cong Pháp B",
    "Curves",
    "french-curve",
    {
      ...sewing,
      variant: 1,
      aliases: ["french curve", "thước cong"],
      description: "A compact hooked French curve silhouette.",
    },
  ),
  ruler(
    "french-curve-c",
    "French Curve C",
    "Thước cong Pháp C",
    "Curves",
    "french-curve",
    {
      ...sewing,
      variant: 2,
      aliases: ["french curve", "thước cong"],
      description: "A broad asymmetric French curve silhouette.",
    },
  ),
  ruler(
    "hip-curve",
    "Hip Curve",
    "Thước cong hông",
    "Sewing & Fashion",
    "hip-curve",
    { ...sewing, aliases: ["hip ruler"] },
  ),
  ruler(
    "styling-curve",
    "Styling Curve",
    "Thước cong tạo dáng",
    "Sewing & Fashion",
    "hip-curve",
    { ...sewing, variant: 1, aliases: ["fashion curve"] },
  ),
  ruler(
    "armhole-curve",
    "Armhole Curve",
    "Thước cong nách",
    "Sewing & Fashion",
    "french-curve",
    { ...sewing, variant: 1, aliases: ["armhole ruler"] },
  ),
  ruler(
    "tailor-ruler",
    "Tailor Ruler",
    "Thước may",
    "Sewing & Fashion",
    "hip-curve",
    { ...sewing, aliases: ["sewing ruler", "tailoring ruler"] },
  ),
  ruler(
    "tailor-l-square",
    "L-Square Tailoring Ruler",
    "Thước vuông may chữ L",
    "Sewing & Fashion",
    "l-square",
    { ...sewing, aliases: ["fashion L ruler", "fashion L-ruler", "L square"] },
  ),
  ruler(
    "sleeve-curve",
    "Sleeve Curve",
    "Thước cong tay áo",
    "Sewing & Fashion",
    "hip-curve",
    { ...sewing, variant: 1 },
  ),
  ruler(
    "neckline-curve",
    "Neckline Curve",
    "Thước cong cổ áo",
    "Sewing & Fashion",
    "french-curve",
    { ...sewing, variant: 2 },
  ),
  ruler(
    "quilting-ruler",
    "Quilting Ruler",
    "Thước chần bông",
    "Craft & Cutting",
    "straight",
    {
      ...sewing,
      markingSystem: "grid",
      defaultDimensions: { length: 200, width: 100, thickness: 3 },
      aliases: ["patchwork ruler"],
      tags: ["Craft & Cutting", "Sewing & Fashion"],
    },
  ),
  ruler(
    "sewing-gauge",
    "Sewing Gauge",
    "Thước đo may",
    "Sewing & Fashion",
    "straight",
    {
      ...sewing,
      supportedLengths: [100, 150],
      defaultDimensions: { length: 150, width: 25, thickness: 3 },
      description: "A fixed measuring gauge without a sliding mechanism.",
    },
  ),
  ruler(
    "hem-gauge",
    "Hem Gauge",
    "Thước đo gấu áo",
    "Sewing & Fashion",
    "l-square",
    sewing,
  ),
  ruler(
    "buttonhole-gauge",
    "Buttonhole Gauge",
    "Thước dấu khuy áo",
    "Sewing & Fashion",
    "stencil",
    {
      ...sewing,
      variant: 1,
      description:
        "Repeated circular guides for marking fixed buttonhole spacing.",
    },
  ),
  ruler(
    "seam-allowance",
    "Seam Allowance Ruler",
    "Thước chừa đường may",
    "Sewing & Fashion",
    "straight",
    {
      ...sewing,
      markingSystem: "grid",
      defaultDimensions: { length: 150, width: 50, thickness: 3 },
    },
  ),
  ruler(
    "cutting-ruler",
    "Cutting Ruler",
    "Thước cắt",
    "Craft & Cutting",
    "straight",
    {
      description:
        "A tracing guide in PLA/PETG. Not a certified blade guard or steel cutting edge.",
    },
  ),
  ruler("craft-ruler", "Craft Ruler", "Thước thủ công", "Craft & Cutting"),
  ruler(
    "grid-ruler",
    "Grid Ruler",
    "Thước kẻ ô",
    "Craft & Cutting",
    "straight",
    {
      markingSystem: "grid",
      defaultDimensions: { length: 200, width: 80, thickness: 3 },
      aliases: ["coordinate ruler", "grid coordinate ruler"],
    },
  ),
  ruler(
    "transparent-grid",
    "Transparent Grid-Style Ruler",
    "Thước ô trong suốt",
    "Craft & Cutting",
    "straight",
    {
      markingSystem: "grid",
      ...future(
        "Optically clear material is not currently available. Standard PETG is not guaranteed transparent.",
      ),
    },
  ),
  ruler(
    "paper-craft",
    "Paper Craft Ruler",
    "Thước thủ công giấy",
    "Craft & Cutting",
  ),
  ruler(
    "bookbinding",
    "Bookbinding Ruler",
    "Thước đóng sách",
    "Craft & Cutting",
    "l-square",
  ),
  ruler(
    "scrapbooking",
    "Scrapbooking Ruler",
    "Thước trang trí sổ",
    "Craft & Cutting",
    "straight",
    { markingSystem: "grid" },
  ),
  ruler(
    "corner-ruler",
    "Corner Ruler",
    "Thước đo góc vuông",
    "Craft & Cutting",
    "l-square",
  ),
  ruler(
    "center-finding",
    "Center-Finding Ruler",
    "Thước tìm tâm",
    "Specialty",
    "straight",
    {
      markingSystem: "center-zero",
      aliases: ["centering ruler", "center zero ruler", "thước định tâm"],
    },
  ),
  ruler(
    "circle-center-finder",
    "Circle Center Finder",
    "Thước tìm tâm đường tròn",
    "Specialty",
    "set-square",
    {
      variant: 45,
      ...future(
        "Centre-finding stops need a validated fixture geometry. Catalog preview only.",
      ),
    },
  ),
  ruler(
    "angle-guide",
    "Angle Guide Ruler",
    "Thước hướng dẫn góc",
    "Specialty",
    "protractor",
    { markingSystem: "angle" },
  ),
  ruler(
    "right-to-left",
    "Right-to-Left Ruler",
    "Thước từ phải sang trái",
    "Specialty",
    "straight",
    { markingSystem: "reverse", aliases: ["RTL ruler", "mirrored ruler"] },
  ),
  ruler(
    "dual-scale",
    "Dual Scale Ruler",
    "Thước hai hệ đo",
    "Measuring",
    "straight",
    {
      measurementSystems: ["dual"],
      aliases: ["metric imperial", "cm mm inch"],
    },
  ),
  ruler(
    "metric-only",
    "Metric-Only Ruler",
    "Thước hệ mét",
    "Measuring",
    "straight",
    { aliases: ["mm cm ruler"] },
  ),
  ruler(
    "imperial-only",
    "Imperial-Only Ruler",
    "Thước hệ inch",
    "Measuring",
    "straight",
    { measurementSystems: ["imperial"], aliases: ["inch ruler"] },
  ),
  ruler(
    "tactile-ruler",
    "Braille / Tactile Ruler",
    "Thước chữ nổi",
    "Specialty",
    "straight",
    {
      aliases: ["accessibility", "braille ruler"],
      ...future(
        "Raised Braille dimensions and tactile readability need accessibility and manufacturing validation.",
      ),
    },
  ),
  ruler(
    "high-contrast",
    "High-Contrast Ruler",
    "Thước tương phản cao",
    "Specialty",
    "straight",
    {
      markingSystem: "large-print",
      description: "Large, protected numerals with automatic contrasting ink.",
    },
  ),
  ruler(
    "large-print",
    "Large-Print Ruler",
    "Thước số lớn",
    "Specialty",
    "straight",
    { markingSystem: "large-print" },
  ),
  ruler(
    "finger-safe",
    "Finger-Safe Cutting Ruler",
    "Thước cắt bảo vệ tay",
    "Craft & Cutting",
    "straight",
    {
      ...future(
        "A protective edge requires safety testing. Not offered as a finger guard.",
      ),
    },
  ),
  ruler(
    "bookmark",
    "Bookmark Ruler",
    "Thước đánh dấu sách",
    "School",
    "straight",
    {
      supportedLengths: [100, 150, 200],
      defaultDimensions: { length: 150, width: 25, thickness: 2 },
    },
  ),
  ruler("pocket", "Pocket Ruler", "Thước bỏ túi", "Straight", "straight", {
    supportedLengths: [100, 150],
    defaultDimensions: { length: 100, width: 25, thickness: 3 },
  }),
  ruler("desk", "Desk Ruler", "Thước để bàn", "Straight", "straight", {
    supportedLengths: [200, 300, 500],
  }),
  ruler(
    "exam",
    "Student Exam Ruler",
    "Thước thi học sinh",
    "School",
    "straight",
    {
      supportsNameTag: false,
      supportsSticker: false,
      supportsDrawing: false,
      supportsText: false,
      customizableRegions: fronts.map((r) => ({
        ...r,
        supportsDrawing: false,
        supportsSticker: false,
        supportsText: false,
      })),
      description:
        "Minimal markings only. Check the rules for your own examination.",
    },
  ),
  ruler(
    "stencil",
    "Stencil Ruler",
    "Thước khuôn hình",
    "Specialty",
    "stencil",
    { aliases: ["shape stencil", "circle triangle square"] },
  ),
  ruler(
    "circle-template",
    "Circle Template Ruler",
    "Thước khuôn tròn",
    "Specialty",
    "stencil",
    { variant: 1, aliases: ["circle drawing template"] },
  ),
  ruler(
    "lettering-guide",
    "Lettering Guide Ruler",
    "Thước hướng dẫn chữ",
    "Specialty",
    "stencil",
    { variant: 2, aliases: ["typography guide ruler"] },
  ),
  ruler(
    "isometric-guide",
    "Isometric Drawing Guide",
    "Thước vẽ đẳng phối",
    "Engineering",
    "set-square",
    { variant: 30, reference: "ISOMETRIC · 30° / 60°" },
  ),
  ruler(
    "perspective-guide",
    "Perspective Drawing Guide",
    "Thước vẽ phối cảnh",
    "Drafting",
    "set-square",
    { variant: 45, reference: "PERSPECTIVE · VANISHING POINT GUIDE" },
  ),
  ruler(
    "number-line",
    "Number Line Ruler",
    "Thước trục số",
    "School",
    "straight",
    {
      markingSystem: "center-zero",
      description:
        "A signed number line with negative values to the left of zero.",
    },
  ),
  ruler(
    "fraction-ruler",
    "Fraction Ruler",
    "Thước phân số",
    "School",
    "straight",
    {
      markingSystem: "fraction",
      measurementSystems: ["imperial"],
      description: "Inch graduations labelled with reduced quarter fractions.",
    },
  ),
  ruler(
    "multiplication",
    "Multiplication Ruler",
    "Thước bảng nhân",
    "School",
    "straight",
    {
      markingSystem: "reference",
      reference: "2×1=2   2×2=4   2×3=6   2×4=8   2×5=10",
    },
  ),
];
const byId = new Map(rulerRegistry.map((r) => [r.id, r]));
export const getRuler = (id?: string) => byId.get(id ?? "") ?? rulerRegistry[0];
export const normalizeSearch = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9:]+/g, " ")
    .trim();
const searchIndex = new Map(
  rulerRegistry.map((r) => [
    r.id,
    normalizeSearch(
      [
        r.id,
        r.name,
        r.vietnameseName,
        ...r.aliases,
        r.category,
        ...r.tags,
        ...r.useCases,
        ...r.measurementSystems,
        ...r.scaleIds,
      ].join(" "),
    ),
  ]),
);
export function searchRulers(
  query: string,
  category = "All",
  system = "all",
  availableOnly = false,
) {
  const words = normalizeSearch(query).split(" ").filter(Boolean);
  return rulerRegistry.filter(
    (r) =>
      (category === "All" ||
        r.category === category ||
        r.tags.includes(category)) &&
      (system === "all" ||
        r.measurementSystems.includes(system as MeasurementSystem)) &&
      (!availableOnly || r.availability === "designable") &&
      words.every((word) => searchIndex.get(r.id)!.includes(word)),
  );
}
