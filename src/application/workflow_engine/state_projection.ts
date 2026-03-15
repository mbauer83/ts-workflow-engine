import type { StateOf } from "../../domain/workflow_registry.js"
import type { PlaceMap } from "./model.js"

const ownKeys = <T extends object>(value: T): Array<keyof T> =>
  Reflect.ownKeys(value) as Array<keyof T>

export function listPlaceLabels<Places extends object>(
  placeMap: PlaceMap<Places>
): Array<keyof Places> {
  return ownKeys(placeMap)
}

export function snapshotWorkflowState<Places extends object>(
  placeMap: PlaceMap<Places>
): { [K in keyof Places]: StateOf<Places, K> } {
  const labels = listPlaceLabels(placeMap)
  return Object.fromEntries(
    labels.map(key => [key, { ...placeMap[key].state }] as const)
  ) as { [K in keyof Places]: StateOf<Places, K> }
}
