import { useMemo, useState } from "react";
import Modal from "../../../components/Modal";
import {
  categories,
  getRuler,
  searchRulers,
  type RulerDefinition,
} from "./registry";
import { getProfile, profilePath } from "../geometry/profiles";
import type { Design } from "../model";
export function RulerThumbnail({ ruler }: { ruler: RulerDefinition }) {
  const profile = useMemo(
    () =>
      getProfile({
        rulerId: ruler.id,
        length: ruler.defaultDimensions.length / 10,
      }),
    [ruler],
  );
  return (
    <svg
      className="ruler-thumbnail"
      viewBox={`-1 -1 ${profile.width + 2} ${profile.height + 2}`}
      aria-label={`${ruler.name} silhouette`}
      role="img"
    >
      <path
        d={profilePath(profile)}
        fill="currentColor"
        fillRule="evenodd"
        stroke="#a4bfb2"
        strokeWidth=".08"
      />
      {profile.line &&
        Array.from({ length: Math.floor(profile.line.length) + 1 }, (_, i) => (
          <line
            key={i}
            x1={profile.line!.x + i}
            x2={profile.line!.x + i}
            y1={profile.line!.y + 0.05}
            y2={profile.line!.y + (i % 5 === 0 ? 0.6 : 0.35)}
            stroke="#284337"
            strokeWidth=".055"
          />
        ))}
      {ruler.geometryType === "triangular-scale" && (
        <path
          d={`M0 ${profile.height / 2}H${profile.width}`}
          stroke="#42614d"
          strokeWidth=".12"
        />
      )}
    </svg>
  );
}
interface Props {
  open: boolean;
  onClose: () => void;
  design: Design;
  onSelect: (id: string, keep: boolean) => void;
}
export default function RulerLibrary({
  open,
  onClose,
  design,
  onSelect,
}: Props) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [system, setSystem] = useState("all"),
    [available, setAvailable] = useState(false),
    [previewId, setPreview] = useState(design.rulerId),
    [confirm, setConfirm] = useState(false);
  const results = useMemo(
    () => searchRulers(query, category, system, available),
    [query, category, system, available],
  );
  const preview = getRuler(previewId);
  const choose = (keep: boolean) => {
    onSelect(preview.id, keep);
    setConfirm(false);
    onClose();
  };
  const select = () => {
    const customized =
      design.layers.length > 0 ||
      design.strokes.length > 0 ||
      (design.tag.enabled && design.tag.text !== "YOUR NAME");
    if (
      customized &&
      getRuler(design.rulerId).geometryType !== preview.geometryType
    ) {
      setConfirm(true);
      return;
    }
    choose(true);
  };
  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirm(false);
        onClose();
      }}
      label="Ruler Library"
    >
      <section className="ruler-library ruler-studio">
        <header className="library-header">
          <div>
            <span>FIND YOUR NEXT TOOL</span>
            <h2>Ruler Library</h2>
            <p>Explore ruler families · Tìm loại thước phù hợp</p>
          </div>
          <button onClick={onClose} aria-label="Close ruler library">
            ✕
          </button>
        </header>
        <div className="library-search">
          <label>
            Search rulers
            <input
              autoFocus
              type="search"
              maxLength={160}
              placeholder="Search rulers… / Tìm thước…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label>
            Measurement
            <select value={system} onChange={(e) => setSystem(e.target.value)}>
              <option value="all">All systems</option>
              <option value="metric">Metric · mm/cm</option>
              <option value="imperial">Imperial · inch</option>
              <option value="dual">Metric + imperial</option>
            </select>
          </label>
          <label className="library-check">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />{" "}
            Designable now
          </label>
        </div>
        <nav className="library-categories" aria-label="Ruler categories">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </nav>
        <div className="library-body">
          <div className="library-results">
            <p role="status">{results.length} rulers found</p>
            {results.length ? (
              <div className="library-grid">
                {results.map((r) => (
                  <button
                    key={r.id}
                    className="ruler-card"
                    aria-pressed={previewId === r.id}
                    onClick={() => {
                      setPreview(r.id);
                      setConfirm(false);
                    }}
                  >
                    <RulerThumbnail ruler={r} />
                    <strong>{r.name}</strong>
                    <span>{r.vietnameseName}</span>
                    <small>
                      {r.category} · {r.defaultDimensions.length / 10} cm
                    </small>
                    <small>
                      {r.availability === "designable"
                        ? "Design ready"
                        : "Coming later"}
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <div className="library-empty">
                <h3>No rulers found for “{query}”</h3>
                <p>Try Straight, Triangle, Scale, Curve or Sewing.</p>
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                    setSystem("all");
                    setAvailable(false);
                  }}
                >
                  Clear search & filters
                </button>
              </div>
            )}
          </div>
          <aside className="library-preview" aria-label="Ruler quick preview">
            <RulerThumbnail ruler={preview} />
            <h3>{preview.name}</h3>
            <p>{preview.vietnameseName}</p>
            <p>{preview.description}</p>
            <p className="studio-hint">
              Sizes:{" "}
              {preview.supportedLengths.map((n) => `${n / 10} cm`).join(" · ")}
            </p>
            <p className="studio-hint">
              {preview.supportedMaterials.length
                ? `Printed material: ${preview.supportedMaterials.join(" / ")}`
                : preview.limitation}
            </p>
            <p className="studio-hint">
              {preview.customizableRegions.map((r) => r.label).join(" · ")}
              {preview.supportsNameTag ? " · Name tag" : ""}
            </p>
            {confirm ? (
              <div className="library-confirm" role="status">
                <strong>Change ruler?</strong>
                <p>
                  This shape has different printable regions. Keep compatible
                  artwork (layers move inside the new shape; drawings are
                  clipped to its outline), or start fresh. Unsupported tag
                  artwork stays in the design and can be restored by choosing a
                  tag-compatible ruler. Undo restores the whole previous design.
                </p>
                <button onClick={() => choose(true)}>
                  Keep compatible customization
                </button>
                <button onClick={() => choose(false)}>Start fresh</button>
                <button onClick={() => setConfirm(false)}>Cancel</button>
              </div>
            ) : (
              <button
                className="studio-primary"
                disabled={preview.availability !== "designable"}
                onClick={select}
              >
                {preview.availability === "designable"
                  ? "Select Ruler"
                  : "Coming later"}
              </button>
            )}
            <p className="studio-hint">
              New ruler types and sizes need a production quote. Large rulers
              may require a larger print bed.
            </p>
          </aside>
        </div>
      </section>
    </Modal>
  );
}
