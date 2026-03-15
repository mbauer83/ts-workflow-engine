import type { EvaluationContext } from "../../domain/transition.js"
import type { StateOf } from "../../domain/workflow_registry.js"
import type { PlaceMap } from "./model.js"
import { listPlaceLabels } from "./state_projection.js"

export function buildEvaluationContext<Places extends object>(
  placeMap: PlaceMap<Places>
): EvaluationContext<Places> {
  const labels = listPlaceLabels(placeMap)
  const allStates = Object.fromEntries(
    labels.map(key => [key, placeMap[key].state] as const)
  ) as EvaluationContext<Places>["allStates"]

  return {
    allStates,
    activePlaces: labels.filter(key => placeMap[key].state.isActive),
    timestampMs: Date.now(),
  }
}

export function collectTransitionInputStates<
  Places extends object,
  Inputs extends readonly (keyof Places)[],
>(
  placeMap: PlaceMap<Places>,
  inputPlaces: Inputs
): {
  [K in Inputs[number]]: StateOf<Places, K>
} {
  return Object.fromEntries(
    inputPlaces.map(place => [place, placeMap[place].state] as const)
  ) as {
    [K in Inputs[number]]: StateOf<Places, K>
  }
}
