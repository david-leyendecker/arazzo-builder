# Context-Sensitive Node Creation with Vue Flow Node Toolbar

This document describes the context-sensitive node creation system implemented in the Arazzo Workflow Builder using Vue Flow Node Toolbar.

## Overview

The application supports hierarchical node creation based on the Arazzo specification structure. Using Vue Flow's Node Toolbar component, you can create parent-child relationships that reflect the actual workflow structure through intuitive hover-based toolbars.

## Node Types

### 1. **Workflow Node** (Root Container)
- **Purpose**: Represents the top-level workflow container
- **Auto-creation**: Automatically created when an OpenAPI specification is added
- **Children**: Can contain Step nodes
- **Context Menu**: Right-click on a Workflow node to add Steps

### 2. **Step Node** (API Operation)
- **Purpose**: Represents an individual API operation in the workflow
- **Children**: Can contain Parameter nodes, Success Criteria nodes, and other Step nodes
- **Context Menu**: Right-click on a Step node to add:
  - Parameters
  - Success Criteria
  - Next Steps (for flow control)

### 3. **Parameter Node**
- **Purpose**: Defines input parameters for a Step
- **Properties**: 
  - Name
  - Location (path, query, header, cookie, body)
  - Value
- **Parent**: Must be connected to a Step node

### 4. **Success Criteria Node**
- **Purpose**: Defines validation rules to determine if a Step succeeded
- **Properties**: Criteria expression (e.g., `$statusCode == 200`)
- **Parent**: Must be connected to a Step node

### 5. **Start/End Nodes**
- **Purpose**: Mark the beginning and end of workflow execution
- **Usage**: Traditional flow control nodes

## Usage Workflow

### Step 1: Add an OpenAPI Source
1. Open the Source Manager panel
2. Add an OpenAPI specification URL
3. **Automatic**: A Workflow root node is created on the canvas

### Step 2: Build the Workflow Structure
1. Hover over the **Workflow node** to see the toolbar → Click "Add Step"
2. A new Step node appears, positioned automatically
3. Hover over the **Step node** to see the toolbar → Choose from:
   - "Parameter" - to add input parameters
   - "Criteria" - to add validation rules
   - "Next Step" - to chain API calls

### Step 3: Configure Child Nodes
- Select any Parameter or Criteria node
- Use the Inspector panel to edit its properties
- Child nodes are automatically linked to their parent Step

## Node Toolbars

The toolbar appears when you hover over nodes and adapts based on the node type:

| Node Type | Available Actions |
|-----------|------------------|
| Workflow node | Add Step |
| Step node | Add Parameter, Add Success Criteria, Add Next Step |
| Parameter/Criteria node | (No toolbar) |

Note: Start and End nodes are available but not included in the toolbar system as they are legacy nodes.

## Programmatic API

The workflow store provides methods to add nodes programmatically:

```typescript
// Add a node to the workflow
workflowStore.addNode({
  id: 'unique-id',
  type: 'step', // 'workflow' | 'start' | 'step' | 'end' | 'parameter' | 'criteria'
  data: { /* node-specific data */ },
  position: { x: 100, y: 100 }
})
```

## Architecture

### Key Files

- **`src/vue-flow/`**: Custom Vue Flow node components with integrated Node Toolbars
- **`src/components/workflow/WorkflowCanvas.vue`**: Canvas component with Vue Flow integration
- **`src/stores/workflow.ts`**: State management with OpenAPI trigger
- **`src/types/arazzo.ts`**: TypeScript type definitions

### Auto-Creation Flow

```
User adds OpenAPI spec
    ↓
workflowStore.loadOpenAPISpec()
    ↓
Set triggerWorkflowNodeCreation timestamp
    ↓
WorkflowCanvas watches trigger
    ↓
Creates WorkflowNode if none exists
    ↓
User builds hierarchy from root
```

## Future Enhancements

- Visual parent-child connectors (tree lines)
- Collapse/expand child nodes
- Drag-and-drop reparenting
- Bulk node creation from OpenAPI operations
- Templates for common patterns
