import { instance } from "@viz-js/viz"

type PropertyRecord = { [K in PropertyKey]?: unknown }

type PlaceLike = {
  readonly interfaceRole?: unknown
}

type TransitionLike = {
  readonly name?: PropertyKey
  readonly inputPlaces?: readonly PropertyKey[]
  readonly outputPlaces?: readonly PropertyKey[]
  readonly priority?: number
}

export type WorkflowNetDiagramSource = {
  readonly places: object
  readonly transitions: object
  readonly title?: string
}

export type DiagramDirection = "LR" | "TB"

export type RenderWorkflowNetOptions = {
  readonly direction?: DiagramDirection
}

function ownEnumerableKeys(target: object): PropertyKey[] {
  return Reflect.ownKeys(target).filter(key =>
    Object.prototype.propertyIsEnumerable.call(target, key)
  )
}

function readFromObject(target: object, key: PropertyKey): unknown {
  return (target as PropertyRecord)[key]
}

function isPropertyKey(value: unknown): value is PropertyKey {
  const valueType = typeof value
  return valueType === "string" || valueType === "number" || valueType === "symbol"
}

function asPropertyKeyArray(value: unknown): PropertyKey[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter(isPropertyKey)
}

function asPlace(value: unknown): PlaceLike {
  if (!value || typeof value !== "object") {
    return {}
  }

  return value as PlaceLike
}

function asTransition(value: unknown): TransitionLike {
  if (!value || typeof value !== "object") {
    return {}
  }

  return value as TransitionLike
}

function keyToLabel(key: PropertyKey): string {
  if (typeof key === "symbol") {
    return key.description ?? key.toString()
  }

  return String(key)
}

function escapeDotLabel(value: string): string {
  const oneBackslash = "\\"
  const twoBackslashes = "\\\\"
  const escapedQuote = String.raw`\"`
  const escapedNewline = String.raw`\n`

  return value
    .replaceAll(oneBackslash, twoBackslashes)
    .replaceAll("\"", escapedQuote)
    .replaceAll("\n", escapedNewline)
}

export function toDot(
  source: WorkflowNetDiagramSource,
  options: RenderWorkflowNetOptions = {}
): string {
  const direction = options.direction ?? "LR"
  const placeKeys = ownEnumerableKeys(source.places)
  const transitionKeys = ownEnumerableKeys(source.transitions)

  const placeNodeIds = new Map<PropertyKey, string>()

  const placeNodeLines: string[] = []
  const transitionNodeLines: string[] = []
  const syntheticPlaceLines: string[] = []
  const edgeLines: string[] = []

  let syntheticPlaceCount = 0

  const ensurePlaceNode = (placeKey: PropertyKey): string => {
    const existingPlaceNodeId = placeNodeIds.get(placeKey)

    if (existingPlaceNodeId) {
      return existingPlaceNodeId
    }

    const nodeId = `p_extra_${syntheticPlaceCount}`
    syntheticPlaceCount += 1

    placeNodeIds.set(placeKey, nodeId)
    const unmappedLabel = `${keyToLabel(placeKey)}\n(unmapped place)`

    syntheticPlaceLines.push(
      `  ${nodeId} [shape=octagon, style=dashed, label="${escapeDotLabel(unmappedLabel)}"];`
    )

    return nodeId
  }

  for (const [index, placeKey] of placeKeys.entries()) {
    const nodeId = `p_${index}`
    placeNodeIds.set(placeKey, nodeId)

    const place = asPlace(readFromObject(source.places, placeKey))
    const isInputInterface = place.interfaceRole === "input"
    const shape = isInputInterface ? "doublecircle" : "circle"

    placeNodeLines.push(
      `  ${nodeId} [shape=${shape}, label="${escapeDotLabel(keyToLabel(placeKey))}"];`
    )
  }

  for (const [index, transitionKey] of transitionKeys.entries()) {
    const nodeId = `t_${index}`

    const transition = asTransition(readFromObject(source.transitions, transitionKey))
    const transitionName = transition.name ?? transitionKey
    const labelLines = [keyToLabel(transitionName)]

    if (typeof transition.priority === "number" && Number.isFinite(transition.priority)) {
      labelLines.push(`priority ${transition.priority}`)
    }

    transitionNodeLines.push(
      `  ${nodeId} [shape=box, style="rounded", label="${escapeDotLabel(labelLines.join("\n"))}"];`
    )

    const inputPlaces = asPropertyKeyArray(transition.inputPlaces)
    for (const inputPlaceKey of inputPlaces) {
      const placeNodeId = ensurePlaceNode(inputPlaceKey)
      edgeLines.push(`  ${placeNodeId} -> ${nodeId};`)
    }

    const outputPlaces = asPropertyKeyArray(transition.outputPlaces)
    for (const outputPlaceKey of outputPlaces) {
      const placeNodeId = ensurePlaceNode(outputPlaceKey)
      edgeLines.push(`  ${nodeId} -> ${placeNodeId};`)
    }
  }

  const lines = [
    "digraph WorkflowNet {",
    `  rankdir=${direction};`,
    "  graph [fontname=\"Helvetica\", overlap=false, splines=true];",
    "  node [fontname=\"Helvetica\"];",
    "  edge [fontname=\"Helvetica\"];",
  ]

  if (source.title) {
    lines.push(
      `  label="${escapeDotLabel(source.title)}";`,
      "  labelloc=\"t\";",
      "  labeljust=\"l\";"
    )
  }

  lines.push(
    "",
    "  // Places",
    ...placeNodeLines,
    ...syntheticPlaceLines,
    "",
    "  // Transitions",
    ...transitionNodeLines,
    "",
    "  // Arcs",
    ...edgeLines,
    "}"
  )

  return `${lines.join("\n")}\n`
}

export async function renderDotToSvg(dot: string): Promise<string> {
  const viz = await instance()
  return viz.renderString(dot, { format: "svg", engine: "dot" })
}

export async function renderWorkflowNetToSvg(
  source: WorkflowNetDiagramSource,
  options: RenderWorkflowNetOptions = {}
): Promise<{ dot: string; svg: string }> {
  const dot = toDot(source, options)
  const svg = await renderDotToSvg(dot)
  return { dot, svg }
}
