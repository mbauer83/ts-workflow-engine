import { success } from "../../../src/common/result.js";
import type { WorkflowPlace } from "../../../src/domain/place.js";
import type { FactoryRegistry } from "../workflow_registry.js";
import { HARDWARE } from "./hardware.js";
import { SOFTWARE } from "./software.js";

export const START = Symbol('Start')
export type StartState = { isActive: boolean }

export const startActions = {
    initialize: async () => success({ isActive: true })
}

export const startPlace: WorkflowPlace<FactoryRegistry, typeof START> = {
  name: START,
  state: { isActive: false },
  actions: startActions,
  preconditions: {
    // These keys tell the Engine where the tokens go. 
    // No need for a separate 'targets' array.
    [HARDWARE]: () => true,
    [SOFTWARE]: () => true
  }
}
