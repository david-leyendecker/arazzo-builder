/**
 * Service for parsing and working with OpenAPI specifications
 */

export interface OpenAPIOperation {
  operationId: string
  method: string
  path: string
  summary?: string
  description?: string
  parameters?: OpenAPIParameter[]
}

export interface OpenAPIParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie' | 'body'
  required?: boolean
  description?: string
  schema?: any
  type?: string
}

export interface ParsedOpenAPISpec {
  sourceName: string
  operations: OpenAPIOperation[]
}

/**
 * Fetch and parse an OpenAPI specification from a URL
 */
export async function fetchOpenAPISpec(url: string, sourceName: string): Promise<ParsedOpenAPISpec> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`)
    }
    
    const contentType = response.headers.get('content-type')
    let spec: any
    
    if (contentType?.includes('application/json')) {
      spec = await response.json()
    } else if (contentType?.includes('yaml') || contentType?.includes('yml')) {
      // For YAML, we'll need to parse it
      const text = await response.text()
      // Import yaml dynamically
      const yaml = await import('js-yaml')
      spec = yaml.load(text)
    } else {
      // Try JSON first, then YAML
      const text = await response.text()
      try {
        spec = JSON.parse(text)
      } catch {
        const yaml = await import('js-yaml')
        spec = yaml.load(text)
      }
    }
    
    return parseOpenAPISpec(spec, sourceName)
  } catch (error) {
    console.error('Error fetching OpenAPI spec:', error)
    throw error
  }
}

/**
 * Parse an OpenAPI specification object and extract operations
 */
export function parseOpenAPISpec(spec: any, sourceName: string): ParsedOpenAPISpec {
  const operations: OpenAPIOperation[] = []
  
  if (!spec || !spec.paths) {
    return { sourceName, operations }
  }
  
  // Iterate through paths
  for (const [path, pathItem] of Object.entries(spec.paths as Record<string, any>)) {
    if (!pathItem || typeof pathItem !== 'object') continue
    
    // Check each HTTP method
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']
    
    for (const method of methods) {
      const operation = pathItem[method]
      if (!operation || typeof operation !== 'object') continue
      
      const operationId = operation.operationId
      if (!operationId) continue
      
      // Extract parameters
      const parameters: OpenAPIParameter[] = []
      
      // Path-level parameters
      if (pathItem.parameters && Array.isArray(pathItem.parameters)) {
        parameters.push(...extractParameters(pathItem.parameters))
      }
      
      // Operation-level parameters
      if (operation.parameters && Array.isArray(operation.parameters)) {
        parameters.push(...extractParameters(operation.parameters))
      }
      
      // Request body (OpenAPI 3.x)
      if (operation.requestBody) {
        const bodyParam = extractRequestBodyParameter(operation.requestBody)
        if (bodyParam) {
          parameters.push(bodyParam)
        }
      }
      
      operations.push({
        operationId,
        method: method.toUpperCase(),
        path,
        summary: operation.summary,
        description: operation.description,
        parameters
      })
    }
  }
  
  return { sourceName, operations }
}

/**
 * Extract parameters from OpenAPI parameter definitions
 */
function extractParameters(params: any[]): OpenAPIParameter[] {
  return params.map(param => {
    const parameter: OpenAPIParameter = {
      name: param.name || '',
      in: param.in || 'query',
      required: param.required || false,
      description: param.description
    }
    
    // Handle schema
    if (param.schema) {
      parameter.schema = param.schema
      parameter.type = param.schema.type
    } else if (param.type) {
      // OpenAPI 2.0 style
      parameter.type = param.type
    }
    
    return parameter
  }).filter(p => p.name)
}

/**
 * Extract request body as a parameter
 */
function extractRequestBodyParameter(requestBody: any): OpenAPIParameter | null {
  if (!requestBody) return null
  
  // Get the first content type (usually application/json)
  const content = requestBody.content
  if (!content) return null
  
  const contentType = Object.keys(content)[0]
  if (!contentType) return null
  
  const mediaType = content[contentType]
  if (!mediaType || !mediaType.schema) return null
  
  return {
    name: 'body',
    in: 'body',
    required: requestBody.required || false,
    description: requestBody.description,
    schema: mediaType.schema,
    type: mediaType.schema.type || 'object'
  }
}

/**
 * Find an operation by operationId across all parsed specs
 */
export function findOperation(
  specs: ParsedOpenAPISpec[],
  operationId: string
): OpenAPIOperation | null {
  for (const spec of specs) {
    const operation = spec.operations.find(op => op.operationId === operationId)
    if (operation) return operation
  }
  return null
}

/**
 * Get all operations from all specs
 */
export function getAllOperations(specs: ParsedOpenAPISpec[]): OpenAPIOperation[] {
  return specs.flatMap(spec => spec.operations)
}

/**
 * Filter operations by search text
 */
export function filterOperations(
  operations: OpenAPIOperation[],
  searchText: string
): OpenAPIOperation[] {
  if (!searchText) return operations
  
  const search = searchText.toLowerCase()
  return operations.filter(op => 
    op.operationId.toLowerCase().includes(search) ||
    op.summary?.toLowerCase().includes(search) ||
    op.description?.toLowerCase().includes(search) ||
    op.path.toLowerCase().includes(search)
  )
}
