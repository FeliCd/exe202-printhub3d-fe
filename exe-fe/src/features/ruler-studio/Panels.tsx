import type { ReactNode } from "react";
import { getRuler, scaleDefinitions } from "./library/registry";
import {
  applyTemplate,
  fonts,
  templates,
  uid,
  type Design,
  type Layer,
  type Surface,
  type Tab,
} from "./model";
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <Field label={label}>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </Field>
);
interface Props {
  design: Design;
  change: (d: Design) => void;
  tab: Tab;
  surface: Surface;
  selected: string;
  select: (id: string) => void;
}
export default function Panels({
  design: d,
  change,
  tab,
  surface,
  selected,
  select,
}: Props) {
  const ruler = getRuler(d.rulerId);
  const tag = (patch: Partial<Design["tag"]>) =>
    change({ ...d, tag: { ...d.tag, ...patch } });
  const layer = d.layers.find((l) => l.id === selected);
  const update = (patch: Partial<Layer>) =>
    change({
      ...d,
      layers: d.layers.map((l) => (l.id === selected ? { ...l, ...patch } : l)),
    });
  const add = (kind: Layer["kind"], text: string) => {
    if (
      d.layers.length >= 24 ||
      (kind === "text" ? !ruler.supportsText : !ruler.supportsSticker)
    )
      return;
    const l: Layer = {
      id: uid(),
      kind,
      text,
      surface,
      x: 0.5,
      y: 0.7,
      size: kind === "sticker" ? 0.3 : 0.16,
      rotation: 0,
      color: "#213c35",
      font: "Modern",
      flip: false,
    };
    change({ ...d, layers: [...d.layers, l] });
    select(l.id);
  };
  return (
    <div
      className="studio-panel"
      role="tabpanel"
      id="studio-controls"
      aria-labelledby={`studio-tab-${tab}`}
      aria-label={`${tab} controls`}
    >
      {tab === "Ruler" && (
        <>
          <h2>{ruler.name}</h2>
          <p>{ruler.description}</p>
          <Field label="Length">
            <select
              value={d.length}
              onChange={(e) =>
                change({
                  ...d,
                  length: Number(e.target.value) as Design["length"],
                })
              }
            >
              {ruler.supportedLengths.map((n) => (
                <option key={n} value={n / 10}>
                  {n / 10} cm
                </option>
              ))}
            </select>
          </Field>
          {ruler.scaleIds.length > 0 && (
            <Field label="Drawing scale">
              <select
                value={d.scaleId}
                onChange={(e) => change({ ...d, scaleId: e.target.value })}
              >
                {scaleDefinitions
                  .filter((s) => ruler.scaleIds.includes(s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} · represented metres
                    </option>
                  ))}
              </select>
            </Field>
          )}
          {ruler.id === "adjustable-set-square" && (
            <Field label="Fixed printed angle">
              <select
                value={d.angle}
                onChange={(e) =>
                  change({ ...d, angle: Number(e.target.value) })
                }
              >
                {[30, 45, 60].map((n) => (
                  <option key={n} value={n}>
                    {n}°
                  </option>
                ))}
              </select>
            </Field>
          )}
          <p className="studio-hint">
            Measurement: {d.measurementSystem} ·{" "}
            {ruler.customizableRegions.map((r) => r.label).join(" / ")}
          </p>
          <Field label="Material">
            <select
              value={d.material}
              onChange={(e) =>
                change({ ...d, material: e.target.value as Design["material"] })
              }
            >
              <option value="PLA">PLA · soft matte</option>
              <option value="PETG">PETG · satin gloss</option>
            </select>
          </Field>
          <ColorField
            label="Ruler color"
            value={d.color}
            onChange={(color) => change({ ...d, color })}
          />
          <div className="studio-swatches">
            {[
              "#d5e5dc",
              "#202e36",
              "#f5ead7",
              "#244d86",
              "#e6c9df",
              "#f0c95b",
            ].map((color) => (
              <button
                key={color}
                aria-label={`Ruler color ${color}`}
                aria-pressed={d.color === color}
                style={{ background: color }}
                onClick={() => change({ ...d, color })}
              />
            ))}
          </div>
          <Field label="Infill">
            <select
              value={d.infill}
              onChange={(e) => change({ ...d, infill: +e.target.value })}
            >
              {[20, 30, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}%
                </option>
              ))}
            </select>
          </Field>
        </>
      )}
      {tab === "Name Tag" && !ruler.supportsNameTag && (
        <p>
          This ruler has no flat name-tag mounting region. Any existing tag is
          retained in your design and becomes available on a compatible ruler.
        </p>
      )}
      {tab === "Name Tag" && ruler.supportsNameTag && (
        <>
          <h2>Put your name on it</h2>
          <label className="studio-row">
            <input
              type="checkbox"
              checked={d.tag.enabled}
              onChange={(e) => tag({ enabled: e.target.checked })}
            />{" "}
            Show name tag
          </label>
          <Field label="Name (28 characters)">
            <input
              maxLength={28}
              value={d.tag.text}
              onChange={(e) => tag({ text: e.target.value })}
            />
          </Field>
          <Field label="Tag shape">
            <select
              value={d.tag.shape}
              onChange={(e) =>
                tag({ shape: e.target.value as Design["tag"]["shape"] })
              }
            >
              <option value="rounded">Rounded rectangle</option>
              <option value="capsule">Capsule</option>
              <option value="badge">Badge</option>
              <option value="square">Soft square</option>
            </select>
          </Field>
          <Field label="Name font">
            <select
              value={d.tag.font}
              onChange={(e) =>
                tag({ font: e.target.value as Design["tag"]["font"] })
              }
            >
              {Object.keys(fonts).map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <div className="studio-row">
            <ColorField
              label="Tag color"
              value={d.tag.color}
              onChange={(color) => tag({ color })}
            />
            <ColorField
              label="Name color"
              value={d.tag.textColor}
              onChange={(textColor) => tag({ textColor })}
            />
          </div>
          <Field label="Finish">
            <select
              value={d.tag.mode}
              onChange={(e) =>
                tag({ mode: e.target.value as Design["tag"]["mode"] })
              }
            >
              <option value="raised">Raised</option>
              <option value="engraved">Engraved appearance</option>
            </select>
          </Field>
          <div className="studio-row">
            {[
              ["Left", 0.25],
              ["Center", 0.5],
              ["Right", 0.75],
            ].map(([label, x]) => (
              <button
                key={label}
                aria-pressed={d.tag.x === x}
                onClick={() => tag({ x: Number(x) })}
              >
                {label}
              </button>
            ))}
          </div>
          <Field label="Tag position">
            <input
              type="range"
              min=".25"
              max=".75"
              step=".01"
              value={d.tag.x}
              onChange={(e) => tag({ x: +e.target.value })}
            />
          </Field>
          <p className="studio-hint">
            Letter relief is a visual finish. Exported STL includes the tag
            body, not engraved or raised lettering.
          </p>
        </>
      )}
      {(tab === "Text" || tab === "Stickers") && (
        <>
          <h2>
            {tab === "Text"
              ? "A few words, your way"
              : "Small details. Big personality."}
          </h2>
          {tab === "Text" ? (
            <button
              disabled={d.layers.length >= 24 || !ruler.supportsText}
              onClick={() => add("text", "Your text")}
            >
              + Add text
            </button>
          ) : (
            <div className="studio-stickers">
              {[
                ["⚙", "Engineering gear"],
                ["⌘", "Technical command"],
                ["✎", "Student pencil"],
                ["★", "Star"],
                ["♥", "Heart"],
                ["✿", "Flower"],
                ["⚡", "Lightning"],
                ["☺", "Smile"],
              ].map(([symbol, label]) => (
                <button
                  key={label}
                  aria-label={`Add ${label}`}
                  title={label}
                  disabled={d.layers.length >= 24 || !ruler.supportsSticker}
                  onClick={() => add("sticker", symbol)}
                >
                  {symbol}
                </button>
              ))}
            </div>
          )}
          <div className="studio-layer-list">
            {d.layers
              .filter((l) => l.surface === surface)
              .map((l) => (
                <button
                  key={l.id}
                  aria-pressed={selected === l.id}
                  onClick={() => select(l.id)}
                >
                  {l.kind === "text" ? "T" : "◇"} {l.text || "Empty text"}
                </button>
              ))}
          </div>
          {layer && (
            <>
              <Field label="Layer text">
                <input
                  value={layer.text}
                  maxLength={40}
                  onChange={(e) => update({ text: e.target.value })}
                />
              </Field>
              <Field label="Layer font">
                <select
                  value={layer.font}
                  onChange={(e) =>
                    update({ font: e.target.value as Layer["font"] })
                  }
                >
                  {Object.keys(fonts).map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <ColorField
                label="Layer color"
                value={layer.color}
                onChange={(color) => update({ color })}
              />
              {(["x", "y", "size", "rotation"] as const).map((key) => (
                <Field
                  key={key}
                  label={
                    {
                      x: "Horizontal position",
                      y: "Vertical position",
                      size: "Size",
                      rotation: "Rotation",
                    }[key]
                  }
                >
                  <input
                    type="range"
                    min={
                      key === "rotation"
                        ? -180
                        : key === "x"
                          ? 0.04
                          : key === "y"
                            ? 0.1
                            : 0.04
                    }
                    max={
                      key === "rotation"
                        ? 180
                        : key === "x"
                          ? 0.96
                          : key === "y"
                            ? 0.9
                            : 0.45
                    }
                    step={key === "rotation" ? 1 : 0.01}
                    value={layer[key]}
                    onChange={(e) => update({ [key]: +e.target.value })}
                  />
                </Field>
              ))}
              <div className="studio-row">
                <button
                  disabled={d.layers.length >= 24}
                  onClick={() => {
                    const copy = {
                      ...layer,
                      id: uid(),
                      x: Math.min(0.96, layer.x + 0.03),
                    };
                    change({ ...d, layers: [...d.layers, copy] });
                    select(copy.id);
                  }}
                >
                  Duplicate layer
                </button>
                <button
                  aria-pressed={layer.flip}
                  onClick={() => update({ flip: !layer.flip })}
                >
                  Flip
                </button>
                <button
                  onClick={() => {
                    change({
                      ...d,
                      layers: d.layers.filter((l) => l.id !== selected),
                    });
                    select("");
                  }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </>
      )}
      {tab === "Draw" && (
        <>
          <h2>Leave your mark</h2>
          <p>
            Draw on the surface below the preview. Your strokes stay editable
            and travel with the saved design.
          </p>
          <p>Use Undo / Redo above to restore a stroke or a cleared drawing.</p>
        </>
      )}
      {tab === "Templates" && (
        <>
          <h2>Start with a mood</h2>
          <p>
            Templates replace colors, layers and ink. Your name and ruler size
            stay. Undo restores your previous design.
          </p>
          <div className="studio-templates">
            {templates.map((t) => (
              <button
                key={t[0]}
                aria-pressed={d.template === t[0]}
                onClick={() => {
                  change(applyTemplate(d, t[0]));
                  select("");
                }}
              >
                <span style={{ background: t[1], color: t[2] }}>
                  0 ┃ 1 ┃ 2 <b>{t[4] || "Aa"}</b>
                </span>
                {t[0]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
