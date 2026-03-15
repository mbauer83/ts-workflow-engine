import { expectAssignable, expectError, expectType } from "tsd"
import type {
  InputInterfacePlaces,
  RegistryValidation,
  SinkPlaces,
  SourcePlaces,
  StateOf,
  TargetsOf,
} from "../src/domain/workflow_registry.js"

declare const ENV: unique symbol
declare const STEP_A: unique symbol
declare const STEP_B: unique symbol
declare const END: unique symbol
declare const GHOST: unique symbol

interface ValidRegistry {
  [ENV]: {
    interface: "input"
    state: { pending: string | null }
  }
  [STEP_A]: {
    state: { leftDone: boolean }
  }
  [STEP_B]: {
    state: { rightDone: boolean }
  }
  [END]: {
    state: {}
  }
}

interface ValidTransitions {
  envStart: {
    inputPlaces: [typeof ENV]
    outputPlaces: [typeof STEP_A, typeof STEP_B]
    priority: 5
  }
  stepAToEnd: {
    inputPlaces: [typeof STEP_A]
    outputPlaces: [typeof END]
    priority: 1
  }
  stepBToEnd: {
    inputPlaces: [typeof STEP_B]
    outputPlaces: [typeof END]
    priority: 1
  }
}

const assertRegistryValid = <Places extends object, Transitions extends object>(
  value: RegistryValidation<Places, Transitions>
) => value

expectType<true>(assertRegistryValid<ValidRegistry, ValidTransitions>(true))
expectType<typeof ENV>(null as unknown as InputInterfacePlaces<ValidRegistry>)
expectType<typeof STEP_A | typeof STEP_B>(null as unknown as SourcePlaces<ValidRegistry, ValidTransitions>)
expectType<typeof END>(null as unknown as SinkPlaces<ValidRegistry, ValidTransitions>)
expectType<typeof END>(null as unknown as TargetsOf<ValidRegistry, ValidTransitions, typeof STEP_A>)
expectAssignable<StateOf<ValidRegistry, typeof STEP_A>>({ isActive: true, leftDone: false })

interface InvalidTargetTransitions {
  envStart: {
    inputPlaces: [typeof ENV]
    outputPlaces: [typeof STEP_A, typeof STEP_B]
    priority: 5
  }
  stepAToGhost: {
    inputPlaces: [typeof STEP_A]
    outputPlaces: [typeof GHOST]
    priority: 1
  }
  stepBToEnd: {
    inputPlaces: [typeof STEP_B]
    outputPlaces: [typeof END]
    priority: 1
  }
}

expectError(assertRegistryValid<ValidRegistry, InvalidTargetTransitions>(true))

interface InvalidInterfaceIncomingTransitions {
  envStart: {
    inputPlaces: [typeof ENV]
    outputPlaces: [typeof STEP_A]
    priority: 5
  }
  stepAToEnv: {
    inputPlaces: [typeof STEP_A]
    outputPlaces: [typeof ENV]
    priority: 1
  }
  stepBToEnd: {
    inputPlaces: [typeof STEP_B]
    outputPlaces: [typeof END]
    priority: 1
  }
}

expectError(assertRegistryValid<ValidRegistry, InvalidInterfaceIncomingTransitions>(true))

interface InvalidInterfaceRoleRegistry {
  [ENV]: {
    interface: "output"
    state: { pending: string | null }
  }
  [STEP_A]: {
    state: { leftDone: boolean }
  }
  [STEP_B]: {
    state: { rightDone: boolean }
  }
  [END]: {
    state: {}
  }
}

expectError(assertRegistryValid<InvalidInterfaceRoleRegistry, ValidTransitions>(true))

interface InvalidMissingEntryRegistry {
  [ENV]: {
    interface: "input"
    state: { pending: string | null }
  }
  [STEP_A]: {
    state: { leftDone: boolean }
  }
  [STEP_B]: {
    state: { rightDone: boolean }
  }
  [END]: {
    state: {}
  }
}

interface InvalidMissingEntryTransitions {
  stepAToEnd: {
    inputPlaces: [typeof STEP_A]
    outputPlaces: [typeof END]
    priority: 1
  }
  stepBToEnd: {
    inputPlaces: [typeof STEP_B]
    outputPlaces: [typeof END]
    priority: 1
  }
}

expectError(assertRegistryValid<InvalidMissingEntryRegistry, InvalidMissingEntryTransitions>(true))

interface InvalidPriorityTransitions {
  envStart: {
    inputPlaces: [typeof ENV]
    outputPlaces: [typeof STEP_A, typeof STEP_B]
    priority: 0
  }
}

type PriorityIssue = Extract<
  RegistryValidation<ValidRegistry, InvalidPriorityTransitions>,
  { __workflow_registry_error: "transition_priority_must_be_positive_integer" }
>

expectAssignable<{
  readonly __workflow_registry_error: "transition_priority_must_be_positive_integer"
  transition: "envStart"
  priority: 0
}>(null as unknown as PriorityIssue)
