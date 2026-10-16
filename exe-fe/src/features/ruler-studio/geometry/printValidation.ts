import type { Design } from '../model';
import { getProfile } from './profiles';
import { surfaceSize } from '../surface';

export interface ValidationIssue {
  layerId?: string;
  field?: string;
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationReport {
  isValid: boolean;
  canExportSTL: boolean;
  issues: ValidationIssue[];
  unsupportedColorLayers: string[];
}

/**
 * Validates design against 3D manufacturing constraints (FDM nozzle limits, minimum floor thickness, bounds).
 */
export function validateDesignForPrint(d: Design): ValidationReport {
  const issues: ValidationIssue[] = [];
  const unsupportedColorLayers: string[] = [];
  const profile = getProfile(d);
  const thicknessMm = profile.thickness * 10; // convert cm to mm

  // 1. Check Name Tag
  if (d.tag.enabled && d.tag.text) {
    const textMode = d.tag.textMode || 'raised';
    const depthMm = d.tag.textDepth ?? 0.6;

    if (textMode === 'surface-color') {
      unsupportedColorLayers.push(`Bảng tên: "${d.tag.text}" (chỉ in màu)`);
    } else if (textMode === 'engraved') {
      const tagBodyThicknessMm = (d.tag.mode === 'raised' ? 0.16 : 0.1) * 10;
      const totalDepthCapacityMm = tagBodyThicknessMm + thicknessMm;
      if (depthMm >= totalDepthCapacityMm - 0.6) {
        issues.push({
          field: 'tag',
          type: 'error',
          message: `Khắc chìm thẻ tên (${depthMm} mm) quá sâu làm thủng đáy thước (${(totalDepthCapacityMm - depthMm).toFixed(1)} mm còn lại).`,
        });
      } else if (depthMm > tagBodyThicknessMm) {
        issues.push({
          field: 'tag',
          type: 'warning',
          message: `Khắc chìm thẻ tên (${depthMm} mm) sâu hơn độ dày thẻ (${tagBodyThicknessMm.toFixed(1)} mm) và ăn vào thân thước.`,
        });
      }
    }
  }

  // 2. Check Markings
  if (d.markingsMode === 'surface-color') {
    unsupportedColorLayers.push('Vạch đo & số (chỉ in màu bề mặt)');
  } else if (d.markingsMode === 'engraved') {
    const markingsDepthMm = d.markingsDepth ?? 0.4;
    const remainingMm = thicknessMm - markingsDepthMm;
    if (remainingMm < 0.6) {
      issues.push({
        field: 'markings',
        type: 'error',
        message: `Độ sâu khắc vạch đo (${markingsDepthMm} mm) làm đáy thước còn quá mỏng (${remainingMm.toFixed(1)} mm). Yêu cầu tối thiểu 0.6 mm.`,
      });
    }
  }

  // 3. Check individual layers
  d.layers.forEach((l) => {
    if (l.kind === 'text') {
      const mode = l.mode || 'engraved';
      const depthMm = l.depth ?? 0.6;
      const [sw, sh] = surfaceSize(d, l.surface);
      const fontSizeMm = l.size * Math.min(sh, sw * 0.3) * 10;

      if (mode === 'surface-color') {
        unsupportedColorLayers.push(`Chữ: "${l.text}" (chỉ in màu)`);
      } else {
        // Legibility warning
        if (fontSizeMm < 2.5) {
          issues.push({
            layerId: l.id,
            type: 'warning',
            message: `Chữ "${l.text}" cao ${fontSizeMm.toFixed(1)} mm, có thể khó đọc sau khi in 3D (khuyên dùng ≥ 2.5 mm).`,
          });
        }

        // Engraving floor thickness check
        if (mode === 'engraved') {
          const remainingMm = thicknessMm - depthMm;
          if (remainingMm < 0.6) {
            issues.push({
              layerId: l.id,
              type: 'error',
              message: `Khắc chìm chữ "${l.text}" sâu ${depthMm} mm làm đáy thước còn ${remainingMm.toFixed(1)} mm (dễ bị thủng).`,
            });
          }
        }
      }
    } else if (l.kind === 'sticker') {
      // Stickers are currently surface-color by default
      unsupportedColorLayers.push(`Họa tiết sticker "${l.text}" (chỉ in màu bề mặt)`);
    }
  });

  // Check strokes (drawing)
  if (d.strokes.length > 0) {
    unsupportedColorLayers.push(`${d.strokes.length} nét vẽ tự do (chỉ in màu)`);
  }

  const hasErrors = issues.some((i) => i.type === 'error');

  return {
    isValid: !hasErrors,
    canExportSTL: !hasErrors,
    issues,
    unsupportedColorLayers,
  };
}
