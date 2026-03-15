import { expectError, expectType } from "tsd"
import { definePlace } from "../src/domain/place.js"

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
  }
  [WORK]: {
    state: WorkState
  }
  [END]: {
    state: EndState
  }
}

const environmentPlace = definePlace<PlaceRegistry>()(ENV, {
  interfaceRole: "input",
  state: { isActive: false, pending: null },
})

expectType<false>(environmentPlace.state.isActive)
expectType<"input">(environmentPlace.interfaceRole)

const terminalPlace = definePlace<PlaceRegistry>()(END, {
  state: { isActive: false },
})

expectType<false>(terminalPlace.state.isActive)

expectError(
  definePlace<PlaceRegistry>()(WORK, {
    state: { isActive: false },
  })
)

expectError(
  definePlace<PlaceRegistry>()(END, {
    interfaceRole: "input",
    state: { isActive: false },
  })
)
