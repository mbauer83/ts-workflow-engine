import type { WorkflowPlace } from "../../domain/place.js"
import type { WorkflowTransitionMap } from "../../domain/transition.js"

export type PlaceMap<Places extends object> = {
  [K in keyof Places]: WorkflowPlace<Places, K>
}

export type TransitionMap<Places extends object> = WorkflowTransitionMap<Places>

export type TransitionCandidate<Transitions extends object> = {
  transition: keyof Transitions
  priority: number
  order: number
}
