import { NodeEditor, ClassicPreset, type GetSchemes } from 'rete'
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin'
import { VuePlugin } from 'rete-vue-plugin'
import { ConnectionPlugin } from 'rete-connection-plugin'
import { ContextMenuPlugin, Presets as ContextMenuPresets } from 'rete-context-menu-plugin'

/**
 * Start node - represents the beginning of a workflow
 */
export class StartNode extends ClassicPreset.Node {
  constructor(id: string = 'start') {
    super(id)
    this.addOutput('next', new ClassicPreset.Output(new ClassicPreset.Socket('flow')))
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
    this.addInput('prev', new ClassicPreset.Input(new ClassicPreset.Socket('flow')))
    this.addOutput('success', new ClassicPreset.Output(new ClassicPreset.Socket('flow')))
    this.addOutput('failure', new ClassicPreset.Output(new ClassicPreset.Socket('flow')))
  }
}

/**
 * End node - represents the end of a workflow
 */
export class EndNode extends ClassicPreset.Node {
  constructor(id: string = 'end') {
    super(id)
    this.addInput('prev', new ClassicPreset.Input(new ClassicPreset.Socket('flow')))
  }
}

/**
 * Connection type for workflow edges
 */
export class Connection extends ClassicPreset.Connection<StartNode | StepNode | EndNode, StartNode | StepNode | EndNode> {}

// Type definitions for the Rete.js scheme
export type Schemes = GetSchemes<
  StartNode | StepNode | EndNode,
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

  // Setup area plugin
  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl()
  })

  editor.use(area)
  area.use(render)
  area.use(connection)

  // Context menu setup
  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ['Start Node', () => new StartNode('start-' + Math.random())],
      ['Step Node', () => new StepNode('step-' + Math.random(), 'step-' + Math.random())],
      ['End Node', () => new EndNode('end-' + Math.random())]
    ])
  })

  area.use(contextMenu)

  return {
    editor,
    area,
    destroy: () => area.destroy()
  }
}

/**
 * Add a node to the editor
 */
export async function addNode(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, any>,
  node: StartNode | StepNode | EndNode,
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
