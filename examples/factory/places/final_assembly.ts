import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"

export const FINAL_ASSEMBLY = Symbol("final_assembly")

export type FinalAssemblyState = {
  assembledWorkOrderId: string | null
}

export const finalAssemblyPlace = definePlace<FactoryRegistry>()(FINAL_ASSEMBLY, {
  state: {
    isActive: false,
    assembledWorkOrderId: null,
  },
})
