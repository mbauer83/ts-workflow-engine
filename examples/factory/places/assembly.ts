import type { WorkflowPlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"
import { SHIPPING } from "./shipping.js"

export const ASSEMBLY = Symbol('Assembly')

export type AssemblyState = { isActive: boolean }

export const assemblyActions = {}

export const assemblyPlace: WorkflowPlace<FactoryRegistry, typeof ASSEMBLY> = {
  name: ASSEMBLY,
  state: { isActive: false },
  actions: assemblyActions,
  preconditions: {
    [SHIPPING]: () => true
  }
}
