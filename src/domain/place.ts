import type { DeepPartial } from "../common/deep_partial.js"
import type { InterfaceRoleOf, StateOf, TargetsOf } from "./workflow_registry.js"

export type EvaluationContext<R extends object> = {
  allStates: { [K in keyof R]: StateOf<R, K> }
  activePlaces: (keyof R)[]
  timestampMs: number
}

export type TransitionGuardsOf<R extends object, Name extends keyof R> =
  TargetsOf<R, Name> extends never
    ? Record<never, never>
    : {
        [T in TargetsOf<R, Name>]: (
          from: StateOf<R, Name>,
          to: StateOf<R, T>,
          ctx: EvaluationContext<R>
        ) => boolean
      }

export type TransitionEffectsOf<R extends object, Name extends keyof R> =
  TargetsOf<R, Name> extends never
    ? Record<never, never>
    : {
        [T in TargetsOf<R, Name>]?: (
          from: StateOf<R, Name>,
          to: StateOf<R, T>,
          ctx: EvaluationContext<R>
        ) => DeepPartial<StateOf<R, T>>
      }

export interface WorkflowPlace<R extends object, Name extends keyof R> {
  readonly name: Name
  readonly interfaceRole: InterfaceRoleOf<R, Name>
  state: StateOf<R, Name>
  readonly transitionGuards: TransitionGuardsOf<R, Name>
  readonly transitionEffects: TransitionEffectsOf<R, Name>
}

type PlaceDefinition<R extends object, Name extends keyof R, S extends StateOf<R, Name>> = {
  interfaceRole?: InterfaceRoleOf<R, Name>
  state: S
  transitionGuards: TransitionGuardsOf<R, Name>
  transitionEffects?: TransitionEffectsOf<R, Name>
}

export function definePlace<R extends object>() {
  return <Name extends keyof R, S extends StateOf<R, Name>>(
    name: Name,
    definition: PlaceDefinition<R, Name, S>
  ): WorkflowPlace<R, Name> & { state: S } => ({
    name,
    interfaceRole: (definition.interfaceRole ?? "internal") as InterfaceRoleOf<R, Name>,
    state: definition.state,
    transitionGuards: definition.transitionGuards,
    transitionEffects: (definition.transitionEffects ?? {}) as TransitionEffectsOf<R, Name>,
  })
}
