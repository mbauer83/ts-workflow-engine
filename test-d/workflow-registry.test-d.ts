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
    targets: [typeof STEP_A, typeof STEP_B]
  }
  [STEP_A]: {
    state: { leftDone: boolean }
    targets: [typeof END]
  }
  [STEP_B]: {
    state: { rightDone: boolean }
    targets: [typeof END]
  }
  [END]: {
    state: {}
    targets: []
  }
}

const assertRegistryValid = <R extends object>(value: RegistryValidation<R>) => value

expectType<true>(assertRegistryValid<ValidRegistry>(true))
expectType<typeof ENV>(null as unknown as InputInterfacePlaces<ValidRegistry>)
expectType<typeof STEP_A | typeof STEP_B>(null as unknown as SourcePlaces<ValidRegistry>)
expectType<typeof END>(null as unknown as SinkPlaces<ValidRegistry>)
expectType<typeof END>(null as unknown as TargetsOf<ValidRegistry, typeof STEP_A>)
expectAssignable<StateOf<ValidRegistry, typeof STEP_A>>({ isActive: true, leftDone: false })

interface InvalidTargetRegistry {
  [ENV]: {
    interface: "input"
    state: { pending: string | null }
    targets: [typeof STEP_A]
  }
  [STEP_A]: {
    state: { leftDone: boolean }
    targets: [typeof GHOST]
  }
  [STEP_B]: {
    state: { rightDone: boolean }
    targets: [typeof END]
  }
  [END]: {
    state: {}
    targets: []
  }
}

expectError(assertRegistryValid<InvalidTargetRegistry>(true))

interface InvalidInterfaceIncomingRegistry {
  [ENV]: {
    interface: "input"
    state: { pending: string | null }
    targets: [typeof STEP_A]
  }
  [STEP_A]: {
    state: { leftDone: boolean }
    targets: [typeof STEP_B, typeof ENV]
  }
  [STEP_B]: {
    state: { rightDone: boolean }
    targets: [typeof END]
  }
  [END]: {
    state: {}
    targets: []
  }
}

expectError(assertRegistryValid<InvalidInterfaceIncomingRegistry>(true))

interface InvalidInterfaceRoleRegistry {
  [ENV]: {
    interface: "output"
    state: { pending: string | null }
    targets: [typeof STEP_A]
  }
  [STEP_A]: {
    state: { leftDone: boolean }
    targets: [typeof END]
  }
  [STEP_B]: {
    state: { rightDone: boolean }
    targets: [typeof END]
  }
  [END]: {
    state: {}
    targets: []
  }
}

expectError(assertRegistryValid<InvalidInterfaceRoleRegistry>(true))

interface InvalidMissingEntryRegistry {
  [ENV]: {
    interface: "input"
    state: { pending: string | null }
    targets: []
  }
  [STEP_A]: {
    state: { leftDone: boolean }
    targets: [typeof END]
  }
  [STEP_B]: {
    state: { rightDone: boolean }
    targets: [typeof END]
  }
  [END]: {
    state: {}
    targets: []
  }
}

expectError(assertRegistryValid<InvalidMissingEntryRegistry>(true))
