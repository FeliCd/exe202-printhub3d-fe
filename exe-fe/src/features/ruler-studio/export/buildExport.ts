import { STLExporter } from 'three-stdlib';
import { Mesh, MeshStandardMaterial } from 'three';
import JSZip from 'jszip';
import type { Design } from '../model';
import { buildManufacturingSolid } from '../geometry/manufacturing';
import { validateDesignForPrint, type ValidationReport } from '../geometry/printValidation';
import { createExportManifest } from './manifest';

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface ExportSnapshot {
  design: Design;
  name: string;
  length: number;
}

export interface SingleExportResult {
  blob: Blob;
  fileName: string;
  validation?: ValidationReport;
}

export interface PackageExportResult {
  zipBlob: Blob;
  zipFileName: string;
  imageBlob?: Blob | null;
  stlBlob?: Blob | null;
  glbBlob?: Blob | null;
  jsonBlob?: Blob | null;
  validation: ValidationReport;
}

export function sanitizeFileName(name: string): string {
  return (name || 'PrintHub-Thuoc').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF-]/g, '_');
}

/**
 * Builds standalone STL binary blob from a design snapshot with physical geometry.
 */
export async function buildSTLFromDesign(design: Design): Promise<SingleExportResult> {
  const validation = validateDesignForPrint(design);
  if (!validation.canExportSTL) {
    throw new Error(
      validation.issues.find((i) => i.type === 'error')?.message ||
        'Thiết kế vi phạm tiêu chuẩn hình học in 3D.'
    );
  }

  // Generate solid manifold geometry
  const geometry = await buildManufacturingSolid(design, { includePhysicalArtwork: true });

  // Mesh scaled by 10 to convert model units (cm) to STL standard units (mm)
  const mesh = new Mesh(geometry, new MeshStandardMaterial());
  mesh.scale.setScalar(10);
  mesh.updateMatrixWorld(true);

  const exporter = new STLExporter();
  const stlData = exporter.parse(mesh, { binary: true });
  const blob = new Blob([stlData.buffer as ArrayBuffer], { type: 'application/octet-stream' });

  const safe = sanitizeFileName(design.name);
  const fileName = `${safe}-${design.length}cm-3D.stl`;

  return { blob, fileName, validation };
}

/**
 * Packages all formats together into a validated zip archive.
 */
export async function buildFullPackage(
  snapshot: ExportSnapshot,
  getGLB: () => Promise<Blob | null>,
  getScreenshot: () => Promise<Blob | null>
): Promise<PackageExportResult> {
  const d = snapshot.design;
  const validation = validateDesignForPrint(d);

  const safe = sanitizeFileName(snapshot.name);
  const stlFileName = `${safe}-${snapshot.length}cm-3D.stl`;
  const glbFileName = `${safe}-${snapshot.length}cm-3D-View360.glb`;
  const imageFileName = `${safe}-render.png`;
  const jsonFileName = `${safe}-Thiet-Ke.json`;
  const manifestFileName = `manifest.json`;
  const zipFileName = `${safe}-${snapshot.length}cm-FullPackage.zip`;

  // Build STL
  let stlBlob: Blob | null = null;
  try {
    const stlRes = await buildSTLFromDesign(d);
    stlBlob = stlRes.blob;
  } catch (err) {
    console.warn('Could not generate STL with physical artwork, falling back to clean solid', err);
    try {
      const fallbackGeo = await buildManufacturingSolid(d, { includePhysicalArtwork: false });
      const mesh = new Mesh(fallbackGeo, new MeshStandardMaterial());
      mesh.scale.setScalar(10);
      mesh.updateMatrixWorld(true);
      const stlData = new STLExporter().parse(mesh, { binary: true });
      stlBlob = new Blob([stlData.buffer as ArrayBuffer], { type: 'application/octet-stream' });
    } catch {
      // ignore
    }
  }

  // Get GLB and Screenshot
  const [glbBlob, imageBlob] = await Promise.all([getGLB(), getScreenshot()]);

  // Manifest
  const manifest = createExportManifest(d, validation, {
    stl: stlBlob ? stlFileName : undefined,
    glb: glbBlob ? glbFileName : undefined,
    image: imageBlob ? imageFileName : undefined,
    json: jsonFileName,
    manifest: manifestFileName,
  });

  const zip = new JSZip();
  if (stlBlob) zip.file(stlFileName, stlBlob);
  if (glbBlob) zip.file(glbFileName, glbBlob);
  if (imageBlob) zip.file(imageFileName, imageBlob);

  const jsonBlob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  zip.file(jsonFileName, jsonBlob);
  zip.file(manifestFileName, JSON.stringify(manifest, null, 2));

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  return {
    zipBlob,
    zipFileName,
    stlBlob,
    glbBlob,
    imageBlob,
    jsonBlob,
    validation,
  };
}
