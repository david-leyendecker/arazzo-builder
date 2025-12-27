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
 * Represents a criterion target for step flow control
 */
export interface ArazzoCriterionTarget {
  type: 'step' | 'end';
  stepId?: string;
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
  successCriteria?: string[];
  onSuccess?: ArazzoCriterionTarget[];
  onFailure?: ArazzoCriterionTarget[];
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
    inputs?: Record<string, unknown>;
    steps: ArazzoStep[];
    outputs?: Record<string, unknown>;
  }[];
}

/**
 * Runtime types for the workflow builder
 */
export type NodeType = 'start' | 'step' | 'end';

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
