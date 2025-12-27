# **Software Design Document: Arazzo Workflow Builder**

## **1\. Introduction**

This document outlines the design for a web application dedicated to the visual creation and editing of **OpenAPI Arazzo** workflows. The application enables users to visually model complex API sequences and export them as standardized YAML specifications. The primary focus is on a context-sensitive user experience.

## **2\. System Architecture**

### **2.1 Frontend Architecture**

The application is implemented as a modern Single-Page Application (SPA).

* **Framework:** **Vue.js 3** (Composition API using \<script setup\>).  
* **Language:** **TypeScript** (Strict Mode) for maximum type safety of specification models.  
* **Node Engine:** **Rete.js v2**. This engine allows for the separation of data logic (editor) and rendering (Vue plugin).  
* **Styling:** **Tailwind CSS** for the user interface.  
* **State Management:** **Pinia** for managing global states.

### **2.2 Architectural Decisions & Trade-Offs**

| Factor | Decision | Trade-Off / Risk |
| :---- | :---- | :---- |
| **Framework** | **Vue.js 3** | **Ecosystem Size:** Compared to React, there are fewer pre-built node UI components. More custom logic for Rete.js integration is required. |
| **Node Engine** | **Rete.js v2** | **Learning Curve:** Rete.js v2 is more powerful than React Flow but also more complex to initialize (plugins, sockets, data-flow engine). |
| **Language** | **TypeScript** | **Initial Overhead:** Defining complex Arazzo types (nested objects, JSON paths) requires more setup time but drastically reduces runtime errors. |
| **Rendering** | **Vue-Render-Plugin** | **Dependency:** We rely on the compatibility of the Rete Vue plugin. Major Vue updates might lead to delays in plugin support. |

### **2.3 Why not React or Vanilla TS?**

* **Against React:** React's "One-Way Data Flow" often conflicts with the imperative nature of graph engines. Rete.js integrates organically into Vue's reactive system (proxy-based) through its plugin structure.  
* **Against Vanilla TS:** The complexity of the property panel (form validation, dynamic inputs based on OpenAPI) would be extremely maintenance-intensive without a framework like Vue.

## **3\. Technical Data Model (TypeScript)**

interface ArazzoStep {  
  stepId: string;  
  operationId: string;  
  description?: string;  
  parameters?: ArazzoParameter\[\];  
  successCriteria?: string\[\];  
  onSuccess?: ArazzoCriterionTarget\[\];  
  onFailure?: ArazzoCriterionTarget\[\];  
}

## **4\. Rete.js Integration & Contextual Logic**

Instead of a static component library, a **context-sensitive creation flow** is implemented:

1. **Context-Menu Plugin:** Right-clicking on the canvas or dragging a connection into empty space opens a menu.  
2. **Socket-Filtering:** Rete.js checks the type of the output socket. If dragging from an onSuccess port, the system automatically suggests new Steps or End nodes.  
3. **Parent-Child Relation:** Nodes can create child nodes (e.g., for complex inputs or assertions) directly via inline buttons on the node itself.

## **5\. UI/UX Design Components**

1. **Workflow Canvas:** Main area (Rete.js).  
2. **Contextual Creator:** A dynamic popup menu that offers relevant Arazzo building blocks based on the current focus (e.g., selected node or active connection).  
3. **Contextual Inspector:** Right panel for detailed attribute editing of the selected node.  
4. **Source Manager:** Management of referenced OpenAPI documents.

## **6\. Implementation Roadmap**

### **Phase 1: Core & Context Logic**

* Setup Vue 3 \+ Vite \+ TS \+ Rete.js.  
* Implementation of the **Context-Menu Plugin** for Rete.js.  
* Development of logic for "Action-Triggered Node Creation".

### **Phase 2: Arazzo Validation & YAML**

* Mapping visual connections to onSuccess/onFailure paths.  
* YAML export logic.

### **Phase 3: Smart Suggestions**

* Suggesting operationIds based on the context of the previous step.
