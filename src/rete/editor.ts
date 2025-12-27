import { NodeEditor, ClassicPreset, type GetSchemes } from 'rete'
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin'
import { VuePlugin, Presets as VuePresets } from 'rete-vue-plugin'
import { ConnectionPlugin } from 'rete-connection-plugin'
import { ContextMenuPlugin } from 'rete-context-menu-plugin'

/**
 * Workflow node - represents a workflow container (root)
 */
export class WorkflowNode extends ClassicPreset.Node {
  workflowId: string

  constructor(id: string, workflowId: string) {
    super(id)
    this.workflowId = workflowId
    this.label = `Workflow: ${workflowId}`
    this.addOutput('steps', new ClassicPreset.Output(new ClassicPreset.Socket('workflow'), 'Steps'))
  }
}

/**
 * Start node - represents the beginning of a workflow
 */
export class StartNode extends ClassicPreset.Node {
  constructor(id: string = 'start') {
    super(id)
    this.label = 'Start'
    this.addOutput('next', new ClassicPreset.Output(new ClassicPreset.Socket('flow'), 'Next'))
  }
}

/**
 * Step node - represents an API operation step
 */
export class StepNode extends ClassicPreset.Node {
  stepId: string
  operationId: string

  constructor(id: string, stepId: string, operationId: string = '') {
    super(id)
    this.stepId = stepId
    this.operationId = operationId
    this.label = operationId || stepId
    this.addInput('prev', new ClassicPreset.Input(new ClassicPreset.Socket('flow'), 'In'))
    this.addOutput('success', new ClassicPreset.Output(new ClassicPreset.Socket('flow'), 'Success'))
    this.addOutput('failure', new ClassicPreset.Output(new ClassicPreset.Socket('flow'), 'Failure'))
  }
}

/**
 * End node - represents the end of a workflow
 */
export class EndNode extends ClassicPreset.Node {
  constructor(id: string = 'end') {
    super(id)
    this.label = 'End'
    this.addInput('prev', new ClassicPreset.Input(new ClassicPreset.Socket('flow'), 'In'))
  }
}

/**
 * Parameter node - represents a step parameter
 */
export class ParameterNode extends ClassicPreset.Node {
  parameterName: string
  parameterIn: string
  parameterValue: string

  constructor(id: string, name: string = '', inLocation: string = 'query', value: string = '') {
    super(id)
    this.parameterName = name
    this.parameterIn = inLocation
    this.parameterValue = value
    this.label = name || 'Parameter'
    this.addInput('step', new ClassicPreset.Input(new ClassicPreset.Socket('parameter'), 'Step'))
  }
}

/**
 * Success Criteria node - represents success validation criteria
 */
export class SuccessCriteriaNode extends ClassicPreset.Node {
  criteria: string

  constructor(id: string, criteria: string = '') {
    super(id)
    this.criteria = criteria
    this.label = 'Success Criteria'
    this.addInput('step', new ClassicPreset.Input(new ClassicPreset.Socket('criteria'), 'Step'))
  }
}

/**
 * Connection type for workflow edges
 */
export class Connection extends ClassicPreset.Connection<
  WorkflowNode | StartNode | StepNode | EndNode | ParameterNode | SuccessCriteriaNode,
  WorkflowNode | StartNode | StepNode | EndNode | ParameterNode | SuccessCriteriaNode
> {}

// Type definitions for the Rete.js scheme
export type Schemes = GetSchemes<
  WorkflowNode | StartNode | StepNode | EndNode | ParameterNode | SuccessCriteriaNode,
  Connection
>

/**
 * Initialize the Rete.js editor with plugins
 */
export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>()
  const area = new AreaPlugin<Schemes, any>(container)
  const connection = new ConnectionPlugin<Schemes, any>()
  const render = new VuePlugin<Schemes, any>()

  // Setup context menu rendering preset
  VuePresets.contextMenu.setup({ delay: 0 })

  // Setup area plugin first
  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  })

  // Register plugins in order
  editor.use(area)
  area.use(render)
  area.use(connection)

  // Add classic preset for rendering nodes, connections, and sockets
  render.addPreset(VuePresets.classic.setup())
  render.addPreset(VuePresets.contextMenu.setup({ delay: 0 }))

  // Store selected node for context menu
  let selectedNode: WorkflowNode | StartNode | StepNode | EndNode | ParameterNode | SuccessCriteriaNode | null = null
  
  // Track selected node
  area.addPipe((context: any) => {
    if (context.type === 'nodepicked') {
      selectedNode = context.data
    }
    return context
  })

  // Context menu setup with context-sensitive items
  const contextMenu = new ContextMenuPlugin<Schemes>({
    items(context) {
      console.log('Context menu items called with context:', context)
      
      if (context === 'root') {
        // Root context menu - basic nodes
        return {
          searchBar: false,
          list: [
            { 
              label: 'Add Workflow', 
              key: 'workflow', 
              handler: async () => {
                console.log('Add Workflow clicked')
                const node = new WorkflowNode('workflow-' + Date.now(), 'workflow-' + Date.now())
                await editor.addNode(node)
                const view = area.nodeViews.get(node.id)
                if (view) {
                  await area.translate(node.id, view.position)
                }
              }
            },
            { 
              label: 'Add Start Node', 
              key: 'start', 
              handler: async () => {
                console.log('Add Start clicked')
                const node = new StartNode('start-' + Date.now())
                await editor.addNode(node)
                const view = area.nodeViews.get(node.id)
                if (view) {
                  await area.translate(node.id, view.position)
                }
              }
            },
            { 
              label: 'Add End Node', 
              key: 'end', 
              handler: async () => {
                console.log('Add End clicked')
                const node = new EndNode('end-' + Date.now())
                await editor.addNode(node)
                const view = area.nodeViews.get(node.id)
                if (view) {
                  await area.translate(node.id, view.position)
                }
              }
            }
          ]
        }
      }
      
      if (context && typeof context === 'object' && 'id' in context) {
        // Node context menu - based on node type
        const node = context as any
        console.log('Node context menu for:', node.constructor.name, node)
        
        if (node instanceof WorkflowNode) {
          return {
            searchBar: false,
            list: [
              { 
                label: 'Add Step', 
                key: 'step', 
                handler: async () => {
                  console.log('Add Step clicked for workflow:', node.id)
                  const stepNode = new StepNode('step-' + Date.now(), 'step-' + Date.now())
                  await editor.addNode(stepNode)
                  
                  // Position relative to parent
                  const parentView = area.nodeViews.get(node.id)
                  if (parentView) {
                    await area.translate(stepNode.id, { 
                      x: parentView.position.x + 250, 
                      y: parentView.position.y 
                    })
                  }
                }
              }
            ]
          }
        }
        
        if (node instanceof StepNode) {
          return {
            searchBar: false,
            list: [
              { 
                label: 'Add Parameter', 
                key: 'parameter', 
                handler: async () => {
                  console.log('Add Parameter clicked for step:', node.id)
                  const paramNode = new ParameterNode('param-' + Date.now())
                  await editor.addNode(paramNode)
                  
                  const parentView = area.nodeViews.get(node.id)
                  if (parentView) {
                    await area.translate(paramNode.id, { 
                      x: parentView.position.x + 250, 
                      y: parentView.position.y - 100 
                    })
                  }
                }
              },
              { 
                label: 'Add Success Criteria', 
                key: 'criteria', 
                handler: async () => {
                  console.log('Add Criteria clicked for step:', node.id)
                  const criteriaNode = new SuccessCriteriaNode('criteria-' + Date.now())
                  await editor.addNode(criteriaNode)
                  
                  const parentView = area.nodeViews.get(node.id)
                  if (parentView) {
                    await area.translate(criteriaNode.id, { 
                      x: parentView.position.x + 250, 
                      y: parentView.position.y + 100 
                    })
                  }
                }
              },
              { 
                label: 'Add Next Step', 
                key: 'step', 
                handler: async () => {
                  console.log('Add Next Step clicked for step:', node.id)
                  const nextStep = new StepNode('step-' + Date.now(), 'step-' + Date.now())
                  await editor.addNode(nextStep)
                  
                  const parentView = area.nodeViews.get(node.id)
                  if (parentView) {
                    await area.translate(nextStep.id, { 
                      x: parentView.position.x + 300, 
                      y: parentView.position.y 
                    })
                  }
                }
              }
            ]
          }
        }
      }
      
      return { searchBar: false, list: [] }
    }
  })

  area.use(contextMenu)

  return {
    editor,
    area,
    destroy: () => area.destroy(),
    addChildNode: async (
      parentNodeId: string,
      childType: 'parameter' | 'criteria' | 'step'
    ) => {
      const timestamp = Date.now()
      let node: ParameterNode | SuccessCriteriaNode | StepNode | null = null
      
      if (childType === 'parameter') {
        node = new ParameterNode('param-' + timestamp)
      } else if (childType === 'criteria') {
        node = new SuccessCriteriaNode('criteria-' + timestamp)
      } else if (childType === 'step') {
        node = new StepNode('step-' + timestamp, 'step-' + timestamp)
      }
      
      if (node) {
        await editor.addNode(node)
        
        // Position relative to parent
        const parentView = area.nodeViews.get(parentNodeId)
        if (parentView) {
          const parentPos = parentView.position
          await area.translate(node.id, {
            x: parentPos.x + 250,
            y: parentPos.y + (editor.getNodes().filter(n => n.id.startsWith(childType)).length * 80)
          })
        }
        
        return node
      }
      return null
    }
  }
}

/**
 * Add a node to the editor
 */
export async function addNode(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, any>,
  node: WorkflowNode | StartNode | StepNode | EndNode | ParameterNode | SuccessCriteriaNode,
  position: { x: number; y: number }
) {
  await editor.addNode(node)
  await area.translate(node.id, position)
  return node
}

/**
 * Add a connection between nodes
 */
export async function addConnection(
  editor: NodeEditor<Schemes>,
  sourceNodeId: string,
  sourceKey: string,
  targetNodeId: string,
  targetKey: string
) {
  const sourceNode = editor.getNode(sourceNodeId)
  const targetNode = editor.getNode(targetNodeId)
  
  if (!sourceNode || !targetNode) {
    return null
  }

  const sourceOutput = sourceNode.outputs[sourceKey]
  const targetInput = targetNode.inputs[targetKey]

  if (sourceOutput && targetInput) {
    const connection = new Connection(sourceNode, sourceKey as never, targetNode, targetKey as never)
    await editor.addConnection(connection)
    return connection
  }
  
  return null
}
