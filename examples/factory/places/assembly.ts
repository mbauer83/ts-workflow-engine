import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"
import { SHIPPING } from "./shipping.js"

export const ASSEMBLY = Symbol('Assembly')

export type AssemblyState = {}

export const assemblyPlace = definePlace<FactoryRegistry>()(ASSEMBLY, {
  state: { isActive: false },
  transitionGuards: {
    [SHIPPING]: () => true
  }
})
