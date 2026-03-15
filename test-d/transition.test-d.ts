import { expectError, expectType } from "tsd"
import {
  defineTransition,
  type TransitionEffects,
  type TransitionInputStates,
} from "../src/domain/transition.js"

declare const ENV: unique symbol
declare const WORK: unique symbol
declare const END: unique symbol

type EnvironmentState = { pending: string | null }
type WorkState = { ready: boolean; done: boolean }
type EndState = { finalized: boolean }

interface PlaceRegistry {
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

const transition = defineTransition<PlaceRegistry>()(Symbol("EnableWork"), {
  inputPlaces: [ENV, WORK],
  outputPlaces: [WORK, END],
  priority: 3,
  guard: inputs => inputs[ENV].pending !== null && inputs[WORK].ready,
  effects: {
    [WORK]: inputs => ({ done: inputs[ENV].pending === "done" }),
    [END]: (_inputs, to) => ({ finalized: to.finalized }),
  },
})

expectType<3>(transition.priority)

expectType<TransitionInputStates<PlaceRegistry, [typeof ENV, typeof WORK]>>(
  null as unknown as TransitionInputStates<PlaceRegistry, [typeof ENV, typeof WORK]>
)

expectType<TransitionEffects<PlaceRegistry, [typeof ENV], [typeof WORK]>>(
  null as unknown as TransitionEffects<PlaceRegistry, [typeof ENV], [typeof WORK]>
)

expectError(
  defineTransition<PlaceRegistry>()(Symbol("InvalidPriorityZero"), {
    inputPlaces: [ENV],
    outputPlaces: [WORK],
    priority: 0,
  })
)

expectError(
  defineTransition<PlaceRegistry>()(Symbol("InvalidPriorityNegative"), {
    inputPlaces: [ENV],
    outputPlaces: [WORK],
    priority: -1,
  })
)

expectError(
  defineTransition<PlaceRegistry>()(Symbol("InvalidPriorityFloat"), {
    inputPlaces: [ENV],
    outputPlaces: [WORK],
    priority: 1.5,
  })
)

expectError(
  defineTransition<PlaceRegistry>()(Symbol("InvalidEffectTarget"), {
    inputPlaces: [ENV],
    outputPlaces: [WORK],
    effects: {
      [END]: () => ({ finalized: true }),
    },
  })
)
