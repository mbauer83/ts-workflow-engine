import { expectError, expectType } from "tsd"
import { WorkflowEngine } from "../src/application/engine.js"
import { definePlace } from "../src/domain/place.js"
import { defineTransition } from "../src/domain/transition.js"
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
  }
  [WORK]: {
    state: WorkState
  }
  [END]: {
    state: EndState
  }
}

const environmentPlace = definePlace<EngineRegistry>()(ENV, {
  interfaceRole: "input",
  state: { isActive: false, pending: null },
})

const workPlace = definePlace<EngineRegistry>()(WORK, {
  state: { isActive: false, done: false },
})

const endPlace = definePlace<EngineRegistry>()(END, {
  state: { isActive: false },
})

const defineEngineTransition = defineTransition<EngineRegistry>()

const environmentToWork = defineEngineTransition(Symbol("Environment.ToWork"), {
  inputPlaces: [ENV],
  outputPlaces: [WORK],
  priority: 5,
  guard: inputs =>
    inputs[ENV].pending?.kind === "enable" || inputs[ENV].pending?.kind === "work",
  effects: {
    [WORK]: inputs => ({ done: (inputs[ENV].pending?.amount ?? 0) > 0 }),
  },
})

const workToEnd = defineEngineTransition(Symbol("Work.ToEnd"), {
  inputPlaces: [WORK],
  outputPlaces: [END],
  priority: 1,
  guard: inputs => inputs[WORK].done,
})

const engine = WorkflowEngine.create<EngineRegistry>()({
  places: {
    [ENV]: environmentPlace,
    [WORK]: workPlace,
    [END]: endPlace,
  },
  transitions: {
    environmentToWork,
    workToEnd,
  },
  configuration: {
    stabilizationTickLimit: 100,
  },
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
  }
  [CLOSED_END]: {
    state: {}
  }
}

const closedStartInactive = definePlace<ClosedRegistry>()(CLOSED_START, {
  state: { isActive: false },
})

const closedEndPlace = definePlace<ClosedRegistry>()(CLOSED_END, {
  state: { isActive: false },
})

const closedStartToEnd = defineTransition<ClosedRegistry>()(Symbol("Closed.StartToEnd"), {
  inputPlaces: [CLOSED_START],
  outputPlaces: [CLOSED_END],
  priority: 1,
})

expectError(
  WorkflowEngine.create<ClosedRegistry>()({
    places: {
      [CLOSED_START]: closedStartInactive,
      [CLOSED_END]: closedEndPlace,
    },
    transitions: {
      closedStartToEnd,
    },
  })
)
