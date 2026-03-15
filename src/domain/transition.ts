import type { DeepPartial } from "../common/deep_partial.js"
import type { StateOf } from "./workflow_registry.js"

export type EvaluationContext<Places extends object> = {
  allStates: { [K in keyof Places]: StateOf<Places, K> }
  activePlaces: (keyof Places)[]
  timestampMs: number
}

type IsNumberLiteral<N extends number> = number extends N ? false : true

type IsPositiveIntegerLiteral<N extends number> =
  `${N}` extends `${bigint}`
    ? `${N}` extends `-${string}` | "0"
      ? false
      : true
    : false

type PositiveInteger<N extends number> =
  IsNumberLiteral<N> extends false
    ? N
    : IsPositiveIntegerLiteral<N> extends true
      ? N
      : never

export type TransitionInputStates<
  Places extends object,
  Inputs extends readonly (keyof Places)[],
> = {
  [K in Inputs[number]]: StateOf<Places, K>
}

export type TransitionGuard<
  Places extends object,
  Inputs extends readonly (keyof Places)[],
> = (
  inputs: TransitionInputStates<Places, Inputs>,
  ctx: EvaluationContext<Places>
) => boolean

export type TransitionEffects<
  Places extends object,
  Inputs extends readonly (keyof Places)[],
  Outputs extends readonly (keyof Places)[],
> =
  Outputs[number] extends never
    ? Record<never, never>
    : {
        [Target in Outputs[number]]?: (
          inputs: TransitionInputStates<Places, Inputs>,
          to: StateOf<Places, Target>,
          ctx: EvaluationContext<Places>
        ) => DeepPartial<StateOf<Places, Target>>
      }

export interface WorkflowTransition<
  Places extends object,
  Name extends PropertyKey,
  Inputs extends readonly [keyof Places, ...(keyof Places)[]],
  Outputs extends readonly [keyof Places, ...(keyof Places)[]],
  Priority extends number = number,
> {
  readonly name: Name
  readonly inputPlaces: Inputs
  readonly outputPlaces: Outputs
  readonly priority: PositiveInteger<Priority>
  readonly guard: TransitionGuard<Places, Inputs>
  readonly effects: TransitionEffects<Places, Inputs, Outputs>
}

type TransitionDefinition<
  Places extends object,
  Inputs extends readonly [keyof Places, ...(keyof Places)[]],
  Outputs extends readonly [keyof Places, ...(keyof Places)[]],
  Priority extends number,
> = {
  inputPlaces: Inputs
  outputPlaces: Outputs
  priority?: PositiveInteger<Priority>
  guard?: TransitionGuard<Places, Inputs>
  effects?: TransitionEffects<Places, Inputs, Outputs>
}

export function defineTransition<Places extends object>() {
  return <
    Name extends PropertyKey,
    Inputs extends readonly [keyof Places, ...(keyof Places)[]],
    Outputs extends readonly [keyof Places, ...(keyof Places)[]],
    Priority extends number = 1,
  >(
    name: Name,
    definition: TransitionDefinition<Places, Inputs, Outputs, Priority>
  ): WorkflowTransition<Places, Name, Inputs, Outputs, Priority> => ({
    name,
    inputPlaces: definition.inputPlaces,
    outputPlaces: definition.outputPlaces,
    priority: (definition.priority ?? 1) as PositiveInteger<Priority>,
    guard: definition.guard ?? (() => true),
    effects: (definition.effects ?? {}) as TransitionEffects<Places, Inputs, Outputs>,
  })
}

export type AnyWorkflowTransition<Places extends object> = WorkflowTransition<
  Places,
  PropertyKey,
  readonly [keyof Places, ...(keyof Places)[]],
  readonly [keyof Places, ...(keyof Places)[]],
  number
>

export type WorkflowTransitionMap<Places extends object> = Record<
  PropertyKey,
  AnyWorkflowTransition<Places>
>
