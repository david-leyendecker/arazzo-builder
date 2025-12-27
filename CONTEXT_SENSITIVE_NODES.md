# Context-Sensitive Node Creation

This document describes the context-sensitive node creation system implemented in the Arazzo Workflow Builder.

## Overview

The application now supports hierarchical node creation based on the Arazzo specification structure. Instead of a flat list of nodes, you can create parent-child relationships that reflect the actual workflow structure.

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
1. Right-click on the **Workflow node** → Select "Add Step"
2. A new Step node appears, positioned automatically
3. Right-click on the **Step node** → Choose from:
   - "Add Parameter" - to add input parameters
   - "Add Success Criteria" - to add validation rules
   - "Add Next Step" - to chain API calls

### Step 3: Configure Child Nodes
- Select any Parameter or Criteria node
- Use the Inspector panel to edit its properties
- Child nodes are automatically linked to their parent Step

## Context-Sensitive Menus

The right-click context menu adapts based on what you click:

| Context | Available Actions |
|---------|------------------|
| Empty canvas | Add Workflow, Add Start, Add End |
| Workflow node | Add Step |
| Step node | Add Parameter, Add Success Criteria, Add Next Step |
| Parameter/Criteria node | (No children) |

## Programmatic API

The editor instance now exposes an `addChildNode` method:

```typescript
editorInstance.addChildNode(parentNodeId, childType)
```

Parameters:
- `parentNodeId`: The ID of the parent node
- `childType`: One of `'parameter'`, `'criteria'`, or `'step'`

This can be used to create custom UI buttons for adding children.

## Architecture

### Key Files

- **`src/rete/editor.ts`**: Node class definitions and context menu logic
- **`src/components/workflow/WorkflowCanvas.vue`**: Canvas component with auto-creation watcher
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
