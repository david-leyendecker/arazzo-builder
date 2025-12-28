# Arazzo Builder

MVP for visually creating an Arazzo workflow in a browser app.

## Overview

Arazzo Builder is a web application for visually creating and editing OpenAPI Arazzo workflows. It provides an intuitive node-based interface powered by Vue Flow, allowing users to model complex API sequences and export them as standardized YAML specifications.

## Technology Stack

- **Framework**: Vue.js 3 (Composition API with `<script setup>`)
- **Language**: TypeScript (Strict Mode)
- **Node Flow Engine**: Vue Flow v1.48.1
- **UI Components**: PrimeVue 4.5.4
- **State Management**: Pinia
- **Build Tool**: Vite

## Features

- **Visual Workflow Canvas**: Create API workflows using a node-based editor
- **Context-Sensitive Creation**: Right-click menu for adding nodes based on context
- **Contextual Inspector**: Edit node properties in a dedicated side panel
- **Source Manager**: Manage OpenAPI specification references
- **YAML Export**: Export workflows to Arazzo YAML format

## Project Structure

```
src/
├── components/
│   ├── workflow/         # Workflow canvas components
│   ├── inspector/        # Property inspector components
│   └── source-manager/   # OpenAPI source management
├── stores/               # Pinia state stores
│   ├── workflow.ts       # Workflow state management
│   └── editor.ts         # Editor state management
├── vue-flow/             # Vue Flow custom components
│   ├── WorkflowNodeComponent.vue
│   ├── StartNodeComponent.vue
│   ├── StepNodeComponent.vue
│   ├── EndNodeComponent.vue
│   ├── ParameterNodeComponent.vue
│   └── SuccessCriteriaNodeComponent.vue
├── types/                # TypeScript type definitions
│   └── arazzo.ts         # Arazzo specification types
├── App.vue               # Main application component
└── main.ts               # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build for production
npm run build
```

### Preview Production Build

```bash
# Preview the production build
npm run preview
```

## Usage

1. **Adding OpenAPI Sources**: Click "+ Add" in the OpenAPI Sources panel to add an OpenAPI specification
   - The workflow node is automatically created when you add your first OpenAPI source
2. **Adding Child Nodes**: Select Workflow or Step nodes to see the action toolbar with context-specific actions
   - Workflow nodes: Add Step
   - Step nodes: Add Parameter, Add Success Criteria, Add Next Step
3. **Connecting Nodes**: Click and drag from one node to another to create connections
4. **Editing Properties**: Select a node to view and edit its properties in the right panel
5. **Exporting**: Click "Export YAML" to generate the Arazzo workflow specification

## Development Roadmap

### Phase 1: Core & Context Logic ✓
- ✓ Setup Vue 3 + Vite + TS + Vue Flow
- ✓ Implementation of Node Toolbar (migrated from Context Menu)
- ✓ Auto-creation of workflow node when OpenAPI source is added
- ✓ Basic node types (Start, Step, End, Workflow, Parameter, Success Criteria)

### Phase 2: Arazzo Validation & YAML ✓
- ✓ Mapping visual connections to onSuccess/onFailure paths
- ✓ YAML export logic
- ✓ Validation of workflow structure

### Phase 3: Smart Suggestions ✓
- ✓ Suggesting operationIds based on context
- ✓ Auto-completion for parameters
- ✓ Validation against OpenAPI schemas

## Contributing

This is an MVP project. Contributions and suggestions are welcome!

## License

MIT
