import { expectError, expectType } from "tsd"
import { WorkflowEngine } from "../src/application/engine.js"
import { definePlace } from "../src/domain/place.js"
import type { Result } from "../src/common/result.js"

declare const ENV: unique symbol
declare const WORK: unique symbol
declare const END: unique symbol

type EnvironmentState = { pending: { kind: "enable" | "work"; amount?: number } | null }
type WorkState = { done: boolean }
type EndState = {}

interface EngineRegistry {
  [ENV]: {
    interface: "input"
    state: EnvironmentState
    targets: [typeof WORK]
  }
  [WORK]: {
    state: WorkState
    targets: [typeof END]
  }
  [END]: {
    state: EndState
    targets: []
  }
}

const environmentPlace = definePlace<EngineRegistry>()(ENV, {
  interfaceRole: "input",
  state: { isActive: false, pending: null },
  transitionGuards: {
    [WORK]: from => from.pending?.kind === "enable" || from.pending?.kind === "work",
  },
  transitionEffects: {
    [WORK]: from => ({ done: (from.pending?.amount ?? 0) > 0 }),
  },
})

const workPlace = definePlace<EngineRegistry>()(WORK, {
  state: { isActive: false, done: false },
  transitionGuards: {
    [END]: from => from.done,
  },
})

const endPlace = definePlace<EngineRegistry>()(END, {
  state: { isActive: false },
  transitionGuards: {},
})

const engine = WorkflowEngine.create<EngineRegistry>()({
  [ENV]: environmentPlace,
  [WORK]: workPlace,
  [END]: endPlace,
})

expectType<Promise<Result<void, string>>>(
  engine.inject(ENV, { pending: { kind: "enable" } })
)

expectType<Promise<Result<void, string>>>(
  engine.inject(ENV, { pending: { kind: "work", amount: 3 } })
)

expectError(engine.inject(WORK, { isActive: true }))
expectError(engine.inject(ENV, { pending: { kind: "work", amount: "wrong" } }))

declare const CLOSED_START: unique symbol
declare const CLOSED_END: unique symbol

interface ClosedRegistry {
  [CLOSED_START]: {
    state: {}
    targets: [typeof CLOSED_END]
  }
  [CLOSED_END]: {
    state: {}
    targets: []
  }
}

const closedStartInactive = definePlace<ClosedRegistry>()(CLOSED_START, {
  state: { isActive: false },
  transitionGuards: {
    [CLOSED_END]: () => true,
  },
})

const closedEndPlace = definePlace<ClosedRegistry>()(CLOSED_END, {
  state: { isActive: false },
  transitionGuards: {},
})

expectError(
  WorkflowEngine.create<ClosedRegistry>()({
    [CLOSED_START]: closedStartInactive,
    [CLOSED_END]: closedEndPlace,
  })
)
