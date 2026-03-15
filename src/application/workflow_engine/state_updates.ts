import type { DeepPartial } from "../../common/deep_partial.js"
import { deepMerge } from "../../common/deep_merge.js"
import type { StateOf } from "../../domain/workflow_registry.js"
import type { PlaceMap } from "./model.js"

export function applyStateUpdate<Places extends object, L extends keyof Places>(
  placeMap: PlaceMap<Places>,
  label: L,
  update: DeepPartial<StateOf<Places, L>>
) {
  const place = placeMap[label]
  place.state = deepMerge(place.state, update)
}
