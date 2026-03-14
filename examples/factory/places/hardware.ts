import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"
import { ASSEMBLY } from "./assembly.js"
import { SOFTWARE } from "./software.js"

export const HARDWARE = Symbol('Hardware')

export type HardwareState = {
  metalCut: boolean
  lastCutJobId: string | null
}

export const hardwarePlace = definePlace<FactoryRegistry>()(HARDWARE, {
  state: { isActive: false, metalCut: false, lastCutJobId: null },
  transitionGuards: {
    [ASSEMBLY]: (from, to, ctx) => from.metalCut && ctx.allStates[SOFTWARE].codeWritten
  }
})
