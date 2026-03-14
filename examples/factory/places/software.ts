import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"
import { ASSEMBLY } from "./assembly.js"
import { HARDWARE } from "./hardware.js"

export const SOFTWARE = Symbol('Software')

export type SoftwareState = {
  codeWritten: boolean
  lastWriteJobId: string | null
}

export const softwarePlace = definePlace<FactoryRegistry>()(SOFTWARE, {
  state: { isActive: false, codeWritten: false, lastWriteJobId: null },
  transitionGuards: {
    [ASSEMBLY]: (from, to, ctx) => from.codeWritten && ctx.allStates[HARDWARE].metalCut
  }
})
