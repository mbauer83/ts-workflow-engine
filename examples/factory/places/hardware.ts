import type { DeepPartial } from "../../../src/common/deep_partial.js"
import { success, type Result } from "../../../src/common/result.js"
import type { WorkflowPlace } from "../../../src/domain/place.js"
import { delay } from "../../common/delay.js"
import type { FactoryRegistry } from "../workflow_registry.js"
import { ASSEMBLY } from "./assembly.js"
import { SOFTWARE } from "./software.js"

export const HARDWARE = Symbol('Hardware')

export type HardwareState = { isActive: boolean; metalCut: boolean }

export const hardwareActions = {
  cut: async (s: HardwareState): Promise<Result<DeepPartial<HardwareState>>> => {
    await delay(100)
    return success({ metalCut: true })
  }
};

export const hardwarePlace: WorkflowPlace<FactoryRegistry, typeof HARDWARE> = {
  name: HARDWARE,
  state: { isActive: false, metalCut: false },
  actions: hardwareActions,
  preconditions: {
    [ASSEMBLY]: (from, to, ctx) => from.metalCut && ctx.allStates[SOFTWARE].codeWritten
  }
}
