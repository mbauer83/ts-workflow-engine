import { expectError, expectType } from "tsd"
import { definePlace, type TransitionGuardsOf } from "../src/domain/place.js"

declare const ENV: unique symbol
declare const WORK: unique symbol
declare const END: unique symbol

type EnvironmentState = { pending: string | null }
type WorkState = { ready: boolean }
type EndState = {}

interface PlaceRegistry {
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

const environmentPlace = definePlace<PlaceRegistry>()(ENV, {
  interfaceRole: "input",
  state: { isActive: false, pending: null },
  transitionGuards: {
    [WORK]: from => from.pending !== null,
  },
  transitionEffects: {
    [WORK]: () => ({ ready: true }),
  },
})

expectType<false>(environmentPlace.state.isActive)

const terminalPlace = definePlace<PlaceRegistry>()(END, {
  state: { isActive: false },
  transitionGuards: {},
})

expectType<Record<never, never>>(terminalPlace.transitionGuards)

expectError(
  definePlace<PlaceRegistry>()(WORK, {
    state: { isActive: false, ready: false },
    transitionGuards: {},
  })
)

expectType<Record<never, never>>(
  null as unknown as TransitionGuardsOf<PlaceRegistry, typeof END>
)
