import { normalizeDesign, type Design } from '../model';
import { migrateDesign } from './migrate';

export type ParseDesignResult = 
  | { success: true; design: Design; version: 1 | 2; name: string }
  | { success: false; errorKey: 'FILE_TOO_LARGE' | 'INVALID_JSON' | 'UNSUPPORTED_VERSION' | 'INVALID_STRUCTURE'; message: string };

export const MAX_DESIGN_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function parseDesignFile(jsonContent: string, byteLength?: number): ParseDesignResult {
  if (byteLength !== undefined && byteLength > MAX_DESIGN_FILE_SIZE) {
    return {
      success: false,
      errorKey: 'FILE_TOO_LARGE',
      message: 'File vượt quá dung lượng tối đa cho phép (2 MB).',
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonContent);
  } catch {
    return {
      success: false,
      errorKey: 'INVALID_JSON',
      message: 'File không phải là định dạng JSON hợp lệ.',
    };
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      success: false,
      errorKey: 'INVALID_STRUCTURE',
      message: 'Cấu trúc file thiết kế không hợp lệ.',
    };
  }

  const rawObj = raw as Record<string, unknown>;
  const version = rawObj.version;

  if (typeof version !== 'number' || (version !== 1 && version !== 2)) {
    if (typeof version === 'number' && version > 2) {
      return {
        success: false,
        errorKey: 'UNSUPPORTED_VERSION',
        message: `Phiên bản thiết kế (v${version}) mới hơn chưa được phiên bản Studio này hỗ trợ.`,
      };
    }
    return {
      success: false,
      errorKey: 'INVALID_STRUCTURE',
      message: 'File thiếu phiên bản hợp lệ (chỉ hỗ trợ PrintHub Ruler Design v1 hoặc v2).',
    };
  }

  // Basic structural sanity check
  if (rawObj.layers !== undefined && !Array.isArray(rawObj.layers)) {
    return {
      success: false,
      errorKey: 'INVALID_STRUCTURE',
      message: 'Dữ liệu các lớp vẽ (layers) không đúng định dạng mảng.',
    };
  }
  if (rawObj.strokes !== undefined && !Array.isArray(rawObj.strokes)) {
    return {
      success: false,
      errorKey: 'INVALID_STRUCTURE',
      message: 'Dữ liệu nét vẽ tự do (strokes) không đúng định dạng mảng.',
    };
  }

  try {
    let finalDesign: Design;
    if (version === 1) {
      const migrated = migrateDesign(rawObj);
      finalDesign = normalizeDesign(migrated);
    } else {
      finalDesign = normalizeDesign(rawObj);
    }

    return {
      success: true,
      design: finalDesign,
      version: version as 1 | 2,
      name: finalDesign.name || 'Untitled Design',
    };
  } catch (err: unknown) {
    return {
      success: false,
      errorKey: 'INVALID_STRUCTURE',
      message: err instanceof Error ? err.message : 'Không thể chuẩn hóa dữ liệu thiết kế.',
    };
  }
}
