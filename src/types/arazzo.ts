/**
 * Type definitions for OpenAPI Arazzo workflow specification
 * Based on the Arazzo specification for API workflow description
 */

/**
 * Represents a parameter in an Arazzo step
 */
export interface ArazzoParameter {
  name: string;
  in?: 'path' | 'query' | 'header' | 'cookie' | 'body';
  value: string | number | boolean | object;
  description?: string;
}

/**
 * Represents a reusable reference to components, parameters, or actions
 * e.g., { $ref: '#/components/parameters/MyParam' } or a source-based ref
 */
export interface ArazzoReusableRef {
  $ref: string;
}

/**
 * Workflow-level success/failure actions
 * The Arazzo spec allows success/failure action objects or reusable refs.
 * We model action objects as generic maps for forward-compatibility.
 */
export type ArazzoSuccessAction = Record<string, unknown>;
export type ArazzoFailureAction = Record<string, unknown>;

/**
 * Represents a criterion target for step flow control
 */
export interface ArazzoCriterionTarget {
  type: 'step';
  stepId: string;
  criteria?: string[];
}

/**
 * Represents a step in an Arazzo workflow
 */
export interface ArazzoStep {
  stepId: string;
  operationId: string;
  description?: string;
  parameters?: ArazzoParameter[];
  requestBody?: Record<string, unknown>;
  successCriteria?: string[];
  onSuccess: ArazzoCriterionTarget[];
  onFailure: ArazzoCriterionTarget[];
  outputs?: Record<string, unknown>;
}

/**
 * Represents a source document (OpenAPI specification)
 */
export interface ArazzoSourceDescription {
  name: string;
  url: string;
  type?: 'openapi' | 'arazzo';
}

/**
 * Represents a complete Arazzo workflow
 */
export interface ArazzoWorkflow {
  arazzo: string; // Version of Arazzo specification
  info: {
    title: string;
    version: string;
    description?: string;
  };
  sourceDescriptions: ArazzoSourceDescription[];
  workflows: {
    workflowId: string;
    summary?: string;
    description?: string;
    inputs?: Record<string, unknown>; // JSON Schema 2020-12 object
    dependsOn?: string[];
    steps: ArazzoStep[];
    successActions?: (ArazzoSuccessAction | ArazzoReusableRef)[];
    failureActions?: (ArazzoFailureAction | ArazzoReusableRef)[];
    outputs?: Record<string, unknown>;
    parameters?: (ArazzoParameter | ArazzoReusableRef)[];
  }[];
}

/**
 * Runtime types for the workflow builder
 * Note: 'start' and 'end' are UI-only nodes created by WorkflowCanvas, not part of Arazzo spec
 */
export type NodeType = 'step' | 'workflow';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  data: ArazzoStep | Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
