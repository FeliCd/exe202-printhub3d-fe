import StickerPicker from './StickerPicker';
import { getStickerIcon } from './stickerIcons';
import { translateCustom as tr, useCustomLanguage } from './language';
import { TEXT_LIMIT, characters, limitText } from "./text";
import { useId, useState, type ReactNode } from "react";
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
  type PhysicalMode,
  type GraduationMode,
} from "./model";
function LimitedTextInput({ value, onChange }: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [overLimit, setOverLimit] = useState(false);
  const warningId = useId();
  return <>
    <input
      value={value}
      aria-describedby={overLimit ? warningId : undefined}
      onChange={(event) => {
        const text = event.target.value;
        setOverLimit(characters(text).length > TEXT_LIMIT);
        onChange(limitText(text));
      }}
    />
    {overLimit && <p id={warningId} role="alert" className="text-xs text-amber-300">
      {tr('Maximum 100 characters. Only the first 100 characters were kept.')}
    </p>}
  </>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="studio-field">
      <span>{tr(label)}</span>
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
  const { language } = useCustomLanguage();
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
      mode: "engraved",
      depth: 0.6,
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
          <h2>{language === 'vi' ? ruler.vietnameseName : ruler.name}</h2>
          <p>{ruler.description}</p>
          <Field label={tr("Length")}>
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
                  {n / 10} {tr("cm")} </option>
              ))}
            </select>
          </Field>
          {ruler.scaleIds.length > 0 && (
            <Field label={tr("Drawing scale")}>
              <select
                value={d.scaleId}
                onChange={(e) => change({ ...d, scaleId: e.target.value })}
              >
                {scaleDefinitions
                  .filter((s) => ruler.scaleIds.includes(s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} {tr("· represented metres")} </option>
                  ))}
              </select>
            </Field>
          )}
          {ruler.id === "adjustable-set-square" && (
            <Field label={tr("Fixed printed angle")}>
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
          <p className="studio-hint"> {tr("Measurement:")} {d.measurementSystem} ·{" "}
            {ruler.customizableRegions.map((r) => r.label).join(" / ")}
          </p>
          <Field label={tr("Material")}>
            <select
              value={d.material}
              onChange={(e) =>
                change({ ...d, material: e.target.value as Design["material"] })
              }
            >
              <option value="PLA">{tr("PLA · soft matte")}</option>
              <option value="PETG">{tr("PETG · satin gloss")}</option>
            </select>
          </Field>
          <ColorField
            label={tr("Ruler color")}
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
          <Field label={tr("Infill")}>
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
          <Field label={tr("Vạch đo & số khắc")}>
            <select
              value={d.markingsMode || "engraved"}
              onChange={(e) => change({ ...d, markingsMode: e.target.value as GraduationMode })}
            >
              <option value="engraved">{tr("Khắc chìm 3D (Khuyên dùng)")}</option>
              <option value="surface-color">{tr("Chỉ in màu bề mặt")}</option>
            </select>
          </Field>
        </>
      )}
      {tab === "Name Tag" && !ruler.supportsNameTag && (
        <p> {tr("This ruler has no flat name-tag mounting region. Any existing tag is retained in your design and becomes available on a compatible ruler.")} </p>
      )}
      {tab === "Name Tag" && ruler.supportsNameTag && (
        <>
          <h2>{tr("Put your name on it")}</h2>
          <label className="studio-row">
            <input
              type="checkbox"
              checked={d.tag.enabled}
              onChange={(e) => tag({ enabled: e.target.checked })}
            />{" "} {tr("Show name tag")} </label>
          <Field label={tr("Name (100 characters)")}>
            <LimitedTextInput
              value={d.tag.text}
              onChange={(text) => tag({ text })}
            />
          </Field>
          <p className="studio-hint">{characters(d.tag.text).length}{tr("/100 · Text updates live on the 3D name tag.")}</p>
          <Field label={tr("Tag shape")}>
            <select
              value={d.tag.shape}
              onChange={(e) =>
                tag({ shape: e.target.value as Design["tag"]["shape"] })
              }
            >
              <option value="rounded">{tr("Rounded rectangle")}</option>
              <option value="capsule">{tr("Capsule")}</option>
              <option value="badge">{tr("Badge")}</option>
              <option value="square">{tr("Soft square")}</option>
            </select>
          </Field>
          <Field label={tr("Name font")}>
            <select
              value={d.tag.font}
              onChange={(e) =>
                tag({ font: e.target.value as Design["tag"]["font"] })
              }
            >
              {Object.keys(fonts).map((f) => (
                <option key={f} value={f}>{tr(f)}</option>
              ))}
            </select>
          </Field>
          <div className="studio-row">
            <ColorField
              label={tr("Tag color")}
              value={d.tag.color}
              onChange={(color) => tag({ color })}
            />
            <ColorField
              label={tr("Name color")}
              value={d.tag.textColor}
              onChange={(textColor) => tag({ textColor })}
            />
          </div>
          <Field label={tr("Kiểu chữ bảng tên")}>
            <select
              value={d.tag.textMode || "raised"}
              onChange={(e) =>
                tag({ textMode: e.target.value as PhysicalMode })
              }
            >
              <option value="raised">{tr("Chữ nổi 3D (STL)")}</option>
              <option value="engraved">{tr("Khắc chìm 3D (STL)")}</option>
              <option value="surface-color">{tr("Chỉ in màu bề mặt")}</option>
            </select>
          </Field>
          {(d.tag.textMode === "raised" || d.tag.textMode === "engraved") && (
            <Field label={d.tag.textMode === "raised" ? tr("Độ cao chữ nổi (mm)") : tr("Độ sâu khắc (mm)")}>
              <select
                value={d.tag.textDepth ?? 0.6}
                onChange={(e) => tag({ textDepth: +e.target.value })}
              >
                <option value={0.4}>0.4 mm</option>
                <option value={0.6}>0.6 mm {tr("(Khuyên dùng)")}</option>
                <option value={0.8}>0.8 mm</option>
                <option value={1.0}>1.0 mm</option>
              </select>
            </Field>
          )}
          <Field label={tr("Độ dày phôi thẻ")}>
            <select
              value={d.tag.mode}
              onChange={(e) =>
                tag({ mode: e.target.value as Design["tag"]["mode"] })
              }
            >
              <option value="raised">{tr("Thẻ nổi dày (1.6 mm)")}</option>
              <option value="engraved">{tr("Thẻ phẳng mảnh (1.0 mm)")}</option>
            </select>
          </Field>
          <div className="studio-row">
            {[
              ["Left", 0.25],
              ["Center", 0.5],
              ["Right", 0.75],
            ].map(([label, x]) => (
              <button
                key={tr(String(label))}
                aria-pressed={d.tag.x === x}
                onClick={() => tag({ x: Number(x) })}
              >
                {tr(String(label))}
              </button>
            ))}
          </div>
          <Field label={tr("Tag position")}>
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
            {tr("Chữ nổi hoặc khắc chìm trên thẻ tên sẽ được tạo hình học 3D liền khối thực tế trong tệp in STL.")}
          </p>
        </>
      )}
      {(tab === "Text" || tab === "Stickers") && (
        <>
          <h2>
            {tab === "Text"
              ? tr("A few words, your way")
              : tr("Small details. Big personality.")}
          </h2>
          {tab === "Text" ? (
            <button
              disabled={d.layers.length >= 24 || !ruler.supportsText}
              onClick={() => add("text", "Your text")}
            > {tr("+ Add text")} </button>
          ) : (
            <StickerPicker disabled={d.layers.length >= 24 || !ruler.supportsSticker}
              onAdd={(id) => add("sticker", id)} />
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
                  {l.kind === "text" ? tr("T") : "◇"} {(language === 'vi' ? getStickerIcon(l.text)?.vi : getStickerIcon(l.text)?.name) ?? (l.text || tr("Empty text"))}
                </button>
              ))}
          </div>
          {layer && (
            <>
              {!getStickerIcon(layer.text) && (
                <>
                  <Field label={tr("Layer text")}>
                    <LimitedTextInput
                      key={layer.id}
                      value={layer.text}
                      onChange={(text) => update({ text })}
                    />
                  </Field>
                  <p className="studio-hint">{characters(layer.text).length}{tr("/100 · Text updates live on the selected surface.")}</p>
                  <Field label={tr("Layer font")}>
                    <select
                      value={layer.font}
                      onChange={(e) =>
                        update({ font: e.target.value as Layer["font"] })
                      }
                    >
                      {Object.keys(fonts).map((f) => (
                        <option key={f} value={f}>{tr(f)}</option>
                      ))}
                    </select>
                  </Field>
                </>
              )}
              <Field label={tr("Chế độ sản xuất")}>
                <select
                  value={layer.mode || "engraved"}
                  onChange={(e) => update({ mode: e.target.value as PhysicalMode })}
                >
                  <option value="engraved">{tr("Khắc chìm 3D (STL)")}</option>
                  <option value="raised">{tr("Chữ nổi 3D (STL)")}</option>
                  <option value="surface-color">{tr("In màu bề mặt (chỉ xem)")}</option>
                </select>
              </Field>
              {(layer.mode === "engraved" || layer.mode === "raised") && (
                <Field label={layer.mode === "raised" ? tr("Độ cao chữ nổi (mm)") : tr("Độ sâu khắc (mm)")}>
                  <select
                    value={layer.depth ?? 0.6}
                    onChange={(e) => update({ depth: +e.target.value })}
                  >
                    <option value={0.4}>0.4 mm</option>
                    <option value={0.6}>0.6 mm {tr("(Khuyên dùng)")}</option>
                    <option value={0.8}>0.8 mm</option>
                    <option value={1.0}>1.0 mm</option>
                  </select>
                </Field>
              )}
              <ColorField
                label={tr("Layer color")}
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
                > {tr("Duplicate layer")} </button>
                <button
                  aria-pressed={layer.flip}
                  onClick={() => update({ flip: !layer.flip })}
                > {tr("Flip")} </button>
                <button
                  onClick={() => {
                    change({
                      ...d,
                      layers: d.layers.filter((l) => l.id !== selected),
                    });
                    select("");
                  }}
                > {tr("Delete")} </button>
              </div>
            </>
          )}
        </>
      )}
      {tab === "Draw" && (
        <>
          <h2>{tr("Leave your mark")}</h2>
          <p> {tr("Draw on the surface below the preview. Your strokes stay editable and travel with the saved design.")} </p>
          <p>{tr("Use Undo / Redo above to restore a stroke or a cleared drawing.")}</p>
        </>
      )}
      {tab === "Templates" && (
        <>
          <h2>{tr("Start with a mood")}</h2>
          <p> {tr("Templates replace colors, layers and ink. Your name and ruler size stay. Undo restores your previous design.")} </p>
          <div className="studio-templates">
            {templates.map((t) => (
              <button
                key={tr(t[0])}
                aria-pressed={d.template === t[0]}
                onClick={() => {
                  change(applyTemplate(d, t[0]));
                  select("");
                }}
              >
                <span style={{ background: t[1], color: t[2] }}>
                  0 ┃ 1 ┃ 2 <b>{t[4] || tr("Aa")}</b>
                </span>
                {tr(t[0])}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
