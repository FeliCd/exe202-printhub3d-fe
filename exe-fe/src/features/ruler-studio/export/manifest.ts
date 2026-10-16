import type { Design } from '../model';
import { getRuler } from '../library/registry';
import { getProfile } from '../geometry/profiles';
import type { ValidationReport } from '../geometry/printValidation';

export interface ExportManifest {
  manifestVersion: string;
  generatedAt: string;
  generator: string;
  design: {
    id: string;
    name: string;
    rulerId: string;
    rulerName: string;
    lengthCm: number;
    material: string;
    infillPercentage: number;
    color: string;
    dimensionsMm: {
      width: number;
      height: number;
      thickness: number;
    };
  };
  manufacturing: {
    features: {
      nameTag?: {
        enabled: boolean;
        text: string;
        mode: string;
        depthMm: number;
      };
      physicalLayers: {
        id: string;
        text: string;
        surface: string;
        mode: string;
        depthMm: number;
      }[];
      markingsMode: string;
    };
    unsupportedOrColorOnlyContent: string[];
    slicerNotes: string[];
  };
  files: {
    stl?: string;
    glb?: string;
    image?: string;
    json?: string;
    manifest: string;
  };
}

export function createExportManifest(
  d: Design,
  validation: ValidationReport,
  fileNames: { stl?: string; glb?: string; image?: string; json?: string; manifest: string }
): ExportManifest {
  const ruler = getRuler(d.rulerId);
  const profile = getProfile(d);

  return {
    manifestVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    generator: 'PrintHub 3D Ruler Studio Exporter',
    design: {
      id: d.id,
      name: d.name,
      rulerId: d.rulerId,
      rulerName: ruler.name,
      lengthCm: d.length,
      material: d.material,
      infillPercentage: d.infill,
      color: d.color,
      dimensionsMm: {
        width: Math.round(profile.width * 10),
        height: Math.round(profile.height * 10),
        thickness: Number((profile.thickness * 10).toFixed(1)),
      },
    },
    manufacturing: {
      features: {
        nameTag: d.tag.enabled
          ? {
              enabled: true,
              text: d.tag.text,
              mode: d.tag.textMode || 'raised',
              depthMm: d.tag.textDepth ?? 0.6,
            }
          : undefined,
        physicalLayers: d.layers
          .filter((l) => l.kind === 'text' && l.mode && l.mode !== 'surface-color')
          .map((l) => ({
            id: l.id,
            text: l.text,
            surface: l.surface,
            mode: l.mode || 'engraved',
            depthMm: l.depth ?? 0.6,
          })),
        markingsMode: d.markingsMode || 'engraved',
      },
      unsupportedOrColorOnlyContent: validation.unsupportedColorLayers,
      slicerNotes: [
        `Vật liệu khuyến nghị: ${d.material}`,
        `Độ đặc ruột (Infill): ${d.infill}% (cài đặt trên phần mềm cắt lớp Slicer; tệp STL là mô hình khối đặc kín)`,
        'Đơn vị tệp STL: Milimét (mm), tỉ lệ 1:1',
      ],
    },
    files: fileNames,
  };
}
