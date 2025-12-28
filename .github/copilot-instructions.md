# Arazzo Builder – Copilot Instructions

- **Tech stack**: Vue 3 + TypeScript (script setup), Vite, Tailwind, Pinia, Vue Flow; YAML export via js-yaml. Entry at [src/main.ts](src/main.ts) and shell layout in [src/App.vue](src/App.vue).
- **Authoritative docs**: Prefer [README.md](README.md). Note [software-design-document.md](software-design-document.md) is outdated (references Rete.js); current graph engine is Vue Flow.

## Core data flow
- Pinia is the single source of truth. Workflow graph state lives in [src/stores/workflow.ts](src/stores/workflow.ts); Vue Flow nodes/edges are projections of store data.
- `nodes` (rendered nodes) and `connections` (edges) mirror `workflow.workflows[0].steps` and path info. Step nodes are also stored inside the workflow steps array for YAML export.
- Connections drive `onSuccess`/`onFailure`: `updateConnectionPaths()` recomputes step targets from `connections` before validation/export.
- OpenAPI parsing lives in [src/services/openapi-service.ts](src/services/openapi-service.ts); store caches `parsedSpecs`, exposes `allOperations`, `findOperation`, and validation helpers.

## Components & interaction patterns
- Canvas: [src/components/workflow/WorkflowCanvas.vue](src/components/workflow/WorkflowCanvas.vue) watches store nodes/edges → Vue Flow state, handles `onConnect` → `addConnection`, selection, drag persist, and YAML export (runs `validateWorkflow()` first). Auto-creates the workflow root node when an OpenAPI source loads (`triggerWorkflowNodeCreation`).
- Nodes: Vue Flow node components in [src/vue-flow](src/vue-flow) use `NodeToolbar` for inline actions. `WorkflowNodeComponent` adds a step and connects to it; `StepNodeComponent` can append a next step and delete with reconnection (`removeStepWithReconnect`). Start/End nodes are simple handle-only components.
- Inspector: [src/components/inspector/ContextualInspector.vue](src/components/inspector/ContextualInspector.vue) reads `selectedNode/selectedStep` from the store. Operation ID input shows suggestions from loaded OpenAPI specs (`filterOperations`), validates via store, and auto-populates parameters on valid selection. Manages parameters, success criteria, outputs, requestBody JSON; onSuccess/onFailure are read-only (derived from connections).
- Source manager: [src/components/source-manager/SourceManager.vue](src/components/source-manager/SourceManager.vue) adds/removes OpenAPI sources; adding triggers spec fetch + parse and emits the workflow root creation signal.
- Confirmations: use the shared modal [src/components/common/ConfirmModal.vue](src/components/common/ConfirmModal.vue) instead of `alert/confirm`; see usage in [src/components/source-manager/SourceManager.vue](src/components/source-manager/SourceManager.vue) and [src/vue-flow/StepNodeComponent.vue](src/vue-flow/StepNodeComponent.vue).
- Theme: [src/stores/theme.ts](src/stores/theme.ts) manages light/dark/auto; initialized in [src/main.ts](src/main.ts); toggle UI in [src/components/theme/ThemeToggle.vue](src/components/theme/ThemeToggle.vue).

## Modeling conventions
- Node IDs: workflow root `workflow-root`; steps use `step-${timestamp}`; handles `success`/`failure` on steps, `prev` on targets, `steps` on workflow root. Keep these consistent when adding new node types.
- Adding/removing steps: use store helpers (`addNode`, `removeStepWithReconnect`) so steps array and connections stay in sync. Avoid mutating `nodes`/`connections` directly outside store.
- Validation: `validateWorkflow()` requires start/end nodes, non-empty `operationId` per step, and no orphaned steps; also checks operation IDs against loaded specs when available. Run before export or custom workflows.
- Export: `exportToYAML()` rebuilds connection paths, prunes empty fields, and dumps YAML. Extension uses workflow `info`, `sourceDescriptions`, and `workflows[0]` only.

## Running & dev
- Install: `npm install`. Dev server: `npm run dev`. Build: `npm run build` (runs `vue-tsc -b` then `vite build`). Preview: `npm run preview`.
- Tests: `npm test -- --run` (non-interactive, exits with status code) or `npm test` (watch mode). Use `-- --run` for CI/agent checks; results show pass/fail counts and coverage. Test UI: `npm run test:ui`.
- Sample assets: sample OpenAPI in [public/sample-openapi.json](public/sample-openapi.json); sample workflow spec in [examples/sample-workflow.arazzo.yaml](examples/sample-workflow.arazzo.yaml).

## Tips for agents
- Always funnel graph mutations through the workflow store to keep YAML export coherent and inspector data in sync.
- When introducing new node types or handles, update both Vue Flow components and store path mapping (`updateConnectionPaths`) so onSuccess/onFailure stay accurate.
- Keep UI state derived from store (watchers in WorkflowCanvas). Avoid duplicating node/edge state elsewhere.
- Dark mode: rely on `useThemeStore.applyTheme()` and `dark` class on `html`; tailwind classes already handle dual themes.
- If adding validations or suggestions, reuse `parsedSpecs`/`validateOperationId` rather than refetching specs.

Let me know which sections need more detail or if any behavior is unclear.