# **Software Design Document: Arazzo Workflow Builder**

## **1\. Introduction**

This document outlines the design for a web application dedicated to the visual creation and editing of **OpenAPI Arazzo** workflows. The application enables users to visually model complex API sequences and export them as standardized YAML specifications. The application leverages a context-sensitive user experience powered by Vue Flow for intuitive workflow composition.

## **2\. System Architecture**

### **2.1 Frontend Architecture**

The application is implemented as a modern Single-Page Application (SPA).

* **Framework:** **Vue.js 3** (Composition API using \<script setup\>).  
* **Language:** **TypeScript** (Strict Mode) for maximum type safety of specification models.  
* **Graph Engine:** **Vue Flow v1.48.1**. A lightweight, extensible graph visualization library that enables visual node-based workflow composition with excellent Vue integration.  
* **UI Component Library:** **PrimeVue 4.5.4** with the Aura theme for accessible, production-ready UI components.  
* **State Management:** **Pinia** for centralized workflow state management.  
* **Build Tool:** **Vite** for fast development and optimized production builds.  
* **YAML Export:** **js-yaml** for serializing workflows to standardized Arazzo YAML format.

### **2.2 Architectural Decisions & Trade-Offs**

| Factor | Decision | Trade-Off / Risk |
| :---- | :---- | :---- |
| **Graph Engine** | **Vue Flow v1.48.1** | Lighter weight than Rete.js but less feature-rich; excellent Vue integration and simpler customization for our primary use case of workflow composition. |
| **UI Library** | **PrimeVue** | Larger dependency footprint than minimal CSS solutions, but significantly reduces custom component development and ensures accessible, production-ready components. |
| **Language** | **TypeScript** | Initial setup overhead for complex Arazzo types (nested objects, union types, references), but provides excellent type safety and IDE support. |
| **State Architecture** | **Store-Driven** | Vue Flow nodes/edges are derived projections of Pinia store data; mutations flow through the store, keeping YAML export coherent and inspector synchronized. |

### **2.3 Design Principles**

* **Store-Driven Architecture:** All workflow state flows through Pinia (`useWorkflowStore`). Vue Flow's nodes and edges are derived projections; UI updates originate from store mutations, not direct Vue Flow mutations.  
* **Context-Sensitive UX:** Node Toolbars (via Vue Flow's `@vue-flow/node-toolbar`) surface only relevant actions. Inline buttons on nodes enable step creation, deletion, and property editing without modal dialogs.  
* **Validation-First Export:** Before YAML export, `validateWorkflow()` checks completeness: start/end nodes present, all steps have non-empty `operationId`, no orphaned steps, and operation IDs validate against loaded OpenAPI specs.  
* **OpenAPI Integration:** Loaded specs are cached in the store (`parsedSpecs`); the service layer (`openapi-service.ts`) provides operation lookups and parameter extraction.

## **3\. Technical Data Model (TypeScript)**

Core Arazzo types and UI-specific types are defined in [src/types/arazzo.ts](src/types/arazzo.ts). Key interfaces include:

* **ArazzoStep**: Represents a step in an Arazzo workflow with operationId, parameters, success/failure criteria, and connection targets.
* **ArazzoParameter**: Defines a parameter for a step (name, location, value, type).
* **ArazzoCriterionTarget**: Specifies a target step and optional criteria for success/failure flow control.
* **ArazzoWorkflow**: The root workflow specification containing info, source descriptions, and steps array.
* **WorkflowNode**: Vue Flow node representation with position and step data.
* **WorkflowConnection**: Vue Flow edge representation mapping success/failure handles to target steps.

## **4\. Vue Flow Integration & Context-Sensitive Logic**

### **4.1 Data Flow**

1. **Store State:** Pinia store holds `workflow` (Arazzo spec), `nodes` (Vue Flow nodes), and `connections` (Vue Flow edges).  
2. **Mutations:** All changes to workflow, nodes, or connections go through store actions (`addNode`, `removeStepWithReconnect`, `updateConnectionPaths`, etc.).  
3. **Watchers:** WorkflowCanvas watches store nodes/edges and syncs them to Vue Flow's reactive state.  
4. **Validation & Export:** Before YAML export, `validateWorkflow()` verifies completeness, then `exportToYAML()` prunes empty fields and serializes.

### **4.2 Node Creation & Context Sensitivity**

* **Node Toolbar:** Each node displays a toolbar (via `@vue-flow/node-toolbar`) with context-specific actions:
  - **Workflow Node:** Add Step button
  - **Step Node:** Add Parameter, Add Success Criteria, Add Next Step buttons
  - **Start/End Nodes:** No actions (atomic endpoints)
  
* **Step Deletion with Reconnection:** `removeStepWithReconnect()` handles edge reconnection when a step is deleted, ensuring dangling connections are resolved.

* **Auto-Workflow Creation:** When the first OpenAPI source is added, the system automatically creates and inserts a workflow node.

### **4.3 Connection Mapping**

* **Handles:** Each step node has `success` (green) and `failure` (red) output handles. Connections to the next step's `prev` handle determine `onSuccess`/`onFailure` targets.
* **Path Recomputation:** `updateConnectionPaths()` runs before validation/export to rebuild `onSuccess` and `onFailure` arrays from the current connection state.

## **5\. Component Architecture**

### **5.1 Key Components**

* **WorkflowCanvas** ([src/components/workflow/WorkflowCanvas.vue](src/components/workflow/WorkflowCanvas.vue)): Vue Flow container; handles node/edge creation, selection, drag persistence, and YAML export.
* **ContextualInspector** ([src/components/inspector/ContextualInspector.vue](src/components/inspector/ContextualInspector.vue)): Right panel for editing selected node properties. Shows operation ID input with suggestions, parameter editor, success criteria, and request body JSON.
* **SourceManager** ([src/components/source-manager/SourceManager.vue](src/components/source-manager/SourceManager.vue)): Manages OpenAPI source URIs; triggers spec fetch and workflow node creation.
* **ConfirmModal** ([src/components/common/ConfirmModal.vue](src/components/common/ConfirmModal.vue)): Reusable confirmation dialog for destructive actions (e.g., step deletion).

### **5.2 Vue Flow Node Components**

* **WorkflowNodeComponent**: Root node; displays "Workflow" label and add-step toolbar.
* **StepNodeComponent**: Operation step; shows operation ID and connect/delete buttons.
* **StartNodeComponent / EndNodeComponent**: Atomic nodes with no toolbar actions.

## **6\. OpenAPI Integration**

### **6.1 Service Layer**

* **openapi-service.ts**: Provides `fetchOpenAPISpec()`, `validateOperationId()`, `findOperation()`, and parameter extraction helpers.  
* **Spec Caching:** Loaded specs are stored in `parsedSpecs` (store state); lookups avoid repeated HTTP requests.  
* **Validation:** Operation IDs are validated against loaded specs when available; suggestions auto-populate parameters from the OpenAPI schema.

### **6.2 Inspector Integration**

* Operation ID input shows autocomplete suggestions from all loaded specs (`filterOperations()`).
* Valid operation selection auto-populates parameter suggestions via `suggestedParameters()`.
* Parameter validation leverages OpenAPI schema metadata (type, format, required status).

## **7\. Pinia Store Structure**

### **7.1 useWorkflowStore**

**State:**
- `workflow`: The Arazzo specification (info, sourceDescriptions, workflows[0]).
- `nodes`: Vue Flow node projections.
- `connections`: Vue Flow edge projections.
- `selectedNodeId`: Currently selected node.
- `selectedSourceId`: Currently selected OpenAPI source.
- `parsedSpecs`: Cache of parsed OpenAPI specifications.

**Actions:**
- `addNode(node)`: Add a node to the canvas and store.
- `removeStepWithReconnect(stepId)`: Delete a step and reconnect dangling edges.
- `updateConnectionPaths()`: Rebuild `onSuccess`/`onFailure` from current connections.
- `addConnection(connection)`: Create an edge and validate it.
- `addSource(sourceDescription)`: Register an OpenAPI source.
- `loadOpenAPISpec(sourceId)`: Fetch and parse an OpenAPI spec.
- `validateWorkflow()`: Check completeness (start, end, non-empty operationIds, no orphans).
- `exportToYAML()`: Serialize workflow to Arazzo YAML.

### **7.2 useEditorStore**

**State:**
- Editor-level UI state (theme, panel visibility, etc.).

## **8\. YAML Export & Validation**

### **8.1 Export Pipeline**

1. Call `validateWorkflow()` to ensure the workflow is complete.
2. Call `updateConnectionPaths()` to sync connections into `onSuccess`/`onFailure` arrays.
3. Call `exportToYAML()`:
   - Prune empty properties (undefined, empty arrays).
   - Include only essential workflow info and the first workflow.
   - Serialize via `js-yaml`.

### **8.2 Validation Rules**

- Start node and End node must exist.
- Every step must have a non-empty `operationId`.
- No orphaned steps (all steps are reachable from Start).
- If OpenAPI specs are loaded, `operationId` values must exist in at least one spec.

## **9\. Styling & Theming**

* **Theme:** PrimeVue Aura theme (light/dark).
* **CSS Variables:** Uses Aura design tokens (e.g., `var(--p-surface-0)`, `var(--p-text-color)`, `var(--p-primary-color)`).
* **Dark Mode:** Applied via `.dark-mode` class selector on the root element.
* **Node Styling:** Handled via CSS in Vue Flow node components; success/failure handles use distinct colors (green/red).

## **10\. Implementation Status**

### **Phase 1: Core & Context Logic** ✓

* ✓ Setup Vue 3 \+ Vite \+ TS \+ Vue Flow  
* ✓ Node Toolbar implementation (migrated from Context Menu)  
* ✓ Auto-creation of workflow node when OpenAPI source is added  
* ✓ Basic node types (Start, Step, End, Workflow)  
* ✓ Step creation, deletion, and reconnection

### **Phase 2: Arazzo Validation & YAML** ✓

* ✓ Mapping visual connections to onSuccess/onFailure paths  
* ✓ YAML export logic with validation  
* ✓ Workflow structure validation  
* ✓ Local storage persistence

### **Phase 3: Smart Suggestions & Polish** ✓

* ✓ Operation ID auto-completion from loaded OpenAPI specs  
* ✓ Parameter auto-population and validation  
* ✓ Success criteria and request body editing  
* ✓ OpenAPI spec caching and validation  

## **11\. Future Enhancements**

* **Workflow Branching:** Support for parallel execution paths.
* **Reusable Components:** Definition and reuse of workflow sub-templates.
* **Error Handling:** Custom error handling and retry logic per step.
* **Testing:** Built-in workflow testing and debugging tools.
* **Collaboration:** Multi-user editing and workflow versioning.
* **Advanced Validation:** Integration-level validation against live OpenAPI endpoints.
