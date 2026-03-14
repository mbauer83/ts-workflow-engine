import type { DeepPartial } from "../../../src/common/deep_partial.js"
import { success, type Result } from "../../../src/common/result.js"
import type { WorkflowPlace } from "../../../src/domain/place.js"
import { delay } from "../../common/delay.js"
import type { FactoryRegistry } from "../workflow_registry.js"
import { ASSEMBLY } from "./assembly.js"
import { HARDWARE } from "./hardware.js"

export const SOFTWARE = Symbol('Software')

export type SoftwareState = { isActive: boolean; codeWritten: boolean }

export const softwareActions = {
  write: async (s: SoftwareState): Promise<Result<DeepPartial<SoftwareState>>> => {
    await delay(100)
    return success({ codeWritten: true })
  }
}

export const softwarePlace: WorkflowPlace<FactoryRegistry, typeof SOFTWARE> = {
  name: SOFTWARE,
  state: { isActive: false, codeWritten: false },
  actions: softwareActions,
  preconditions: {
    [ASSEMBLY]: (from, to, ctx) => from.codeWritten && ctx.allStates[HARDWARE].metalCut
  }
}
