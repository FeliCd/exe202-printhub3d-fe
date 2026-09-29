# PrintHub3D ruler studio

The configurator starts with a fresh 20 cm metric PLA straight ruler. Saved local designs are restored explicitly; cart editing passes an initial design. Change Ruler opens a searchable library of 74 definitions, including clearly labelled unavailable concepts.

## Implementation

- `library/registry.ts` owns catalogue metadata, capabilities, supported materials, dimensions, search aliases, scales and availability. Search normalizes English/Vietnamese case, accents and punctuation.
- `geometry/profiles.ts` generates shared silhouettes and cut-outs for both editor clipping and 3D extrusion. `geometry/solid.ts` builds solids, including a true triangular prism.
- `model.ts` normalizes persisted designs and migrates artwork between printable surfaces. Three prism faces have separate artwork. Switching can keep compatible customization or start fresh; history supports undo.
- `surface.ts` paints reusable artwork textures and redraws protected measuring marks over customization. `markings.ts` generates physical metric/imperial graduations and scale labels.
- `SurfaceEditor.tsx` batches pointer movement with animation frames. `liveArtwork.ts` broadcasts transient artwork to the scene while the gesture is in progress; release commits one history entry.
- `Scene.tsx` renders the physical geometry and surface textures, and transitions the camera when the selected surface changes.
- `studio.css` places the 2D editor left and live 3D right in desktop/landscape Draw mode, with a pane switcher for narrow and tablet portrait screens.

## Verification — 2026-09-29

Passed from `exe-fe`:

```powershell
npm run lint
npm run build
node --test tests/*.test.mjs
git diff --check
```

Build includes `tsc -b`. All 11 tests pass, covering search, catalogue uniqueness, solid geometry, printable masks, legacy migration, independent prism faces, scale calculations, template surface selection, narrow-body capabilities, pricing and immutable cart snapshots. Git reports no unmerged entries. Vite still reports chunks above 500 kB; the configurator is lazy loaded but its Three.js dependency contributes a large chunk.

## Remaining verification and integration limits

Manual browser checks at 1366×768, 1920×1080, tablet landscape/portrait and mobile are **not verified for this update**. The browser tool rejected the local preview under its URL security policy. Source and automated checks do not prove visual layout, camera transitions, pointer performance or accessibility on real devices.

New geometries have no production price supplied by the existing application: the UI displays “Quote required” and prevents adding an invented price. Existing supported straight-ruler pricing is retained. Custom-design checkout still needs a backend contract accepting the full design snapshot; no fabricated endpoint or manufacturing validation is added. Coming-later entries cannot be selected. Physical measurement accuracy and print tolerances require manufacturing validation.

Before release, manually check split-view height, mobile switching, live drawing during pointer movement, long library names/queries, scrolling, shape holes, all prism faces, camera reset, retained artwork after switching and undo, save/restore and cart editing.
