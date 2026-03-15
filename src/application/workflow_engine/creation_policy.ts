import type { PlaceMap, TransitionMap } from "./model.js"

const ownKeys = <T extends object>(value: T): Array<keyof T> =>
  Reflect.ownKeys(value) as Array<keyof T>

function assertCorePlaceSet(coreLabels: Array<PropertyKey>) {
  if (coreLabels.length === 0) {
    throw new Error("Workflow net requires at least one core place (non-interface place).")
  }
}

function assertInputInterfacesStartInactive<Places extends object>(
  places: PlaceMap<Places>,
  interfaceLabels: Array<keyof Places>
) {
  const activeInterfaces = interfaceLabels.filter(label => places[label].state.isActive)
  if (activeInterfaces.length > 0) {
    throw new Error("Input interface places must start inactive.")
  }
}

function assertTransitionShape(
  transitionName: PropertyKey,
  transition: {
    priority: number
    inputPlaces: readonly PropertyKey[]
    outputPlaces: readonly PropertyKey[]
  }
) {
  if (!Number.isInteger(transition.priority) || transition.priority <= 0) {
    throw new Error(`Transition '${String(transitionName)}' must have a positive integer priority.`)
  }

  if (transition.inputPlaces.length === 0) {
    throw new Error(`Transition '${String(transitionName)}' must define at least one input place.`)
  }

  if (transition.outputPlaces.length === 0) {
    throw new Error(`Transition '${String(transitionName)}' must define at least one output place.`)
  }
}

function assertTransitionPlacesKnown<Places extends object>(
  transitionName: PropertyKey,
  places: readonly (keyof Places)[],
  placeSet: Set<keyof Places>,
  kind: "input" | "output"
) {
  for (const place of places) {
    if (!placeSet.has(place)) {
      throw new Error(`Transition '${String(transitionName)}' references unknown ${kind} place '${String(place)}'.`)
    }
  }
}

function assertTransitionCatalogIsValid<Places extends object>(
  transitions: TransitionMap<Places>,
  placeSet: Set<keyof Places>
) {
  for (const transitionName of ownKeys(transitions)) {
    const transition = transitions[transitionName]
    if (!transition) continue

    assertTransitionShape(transitionName, transition)
    assertTransitionPlacesKnown(transitionName, transition.inputPlaces, placeSet, "input")
    assertTransitionPlacesKnown(transitionName, transition.outputPlaces, placeSet, "output")
  }
}

function assertOpenNetStartsWithoutCoreTokens(defaultActiveCore: Array<PropertyKey>) {
  if (defaultActiveCore.length > 0) {
    throw new Error("Open workflow net requires all core places to start inactive.")
  }
}

function assertClosedNetInitialMarking<Places extends object>(
  coreLabels: Array<keyof Places>,
  defaultActiveCore: Array<keyof Places>,
  transitions: TransitionMap<Places>
) {
  const coreLabelSet = new Set<keyof Places>(coreLabels)
  const incomingCount = new Map<keyof Places, number>(coreLabels.map(label => [label, 0]))

  for (const transitionName of ownKeys(transitions)) {
    const transition = transitions[transitionName]
    if (!transition) continue

    const coreInputs = transition.inputPlaces.filter(place => coreLabelSet.has(place))
    const coreOutputs = transition.outputPlaces.filter(place => coreLabelSet.has(place))

    if (coreInputs.length === 0 || coreOutputs.length === 0) {
      continue
    }

    for (const output of coreOutputs) {
      incomingCount.set(output, (incomingCount.get(output) ?? 0) + coreInputs.length)
    }
  }

  const sources = coreLabels.filter(label => (incomingCount.get(label) ?? 0) === 0)

  if (sources.length !== 1) {
    throw new Error(`Workflow net requires exactly one source place; found ${sources.length}.`)
  }

  if (defaultActiveCore.length !== 1) {
    throw new Error(`Workflow net requires exactly one default-active core place; found ${defaultActiveCore.length}.`)
  }

  const [source] = sources
  const [active] = defaultActiveCore

  if (source !== active) {
    throw new Error(`Default-active place (${String(active)}) must match the source place (${String(source)}).`)
  }
}

export function assertWorkflowNetCanInitialize<Places extends object>(
  places: PlaceMap<Places>,
  transitions: TransitionMap<Places>
) {
  const labels = ownKeys(places)
  const interfaceLabels = labels.filter(label => places[label].interfaceRole === "input")
  const coreLabels = labels.filter(label => places[label].interfaceRole !== "input")

  assertCorePlaceSet(coreLabels)
  assertInputInterfacesStartInactive(places, interfaceLabels)

  const placeSet = new Set<keyof Places>(labels)
  assertTransitionCatalogIsValid(transitions, placeSet)

  const defaultActiveCore = coreLabels.filter(label => places[label].state.isActive)

  if (interfaceLabels.length > 0) {
    assertOpenNetStartsWithoutCoreTokens(defaultActiveCore)
    return
  }

  assertClosedNetInitialMarking(coreLabels, defaultActiveCore, transitions)
}
