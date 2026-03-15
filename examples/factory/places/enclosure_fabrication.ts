import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"

export const ENCLOSURE_FABRICATION = Symbol("enclosure_fabrication")

export type EnclosureFabricationState = {
  activeWorkOrderId: string | null
  enclosureMilled: boolean
  lastMillingMachineId: string | null
}

export const enclosureFabricationPlace = definePlace<FactoryRegistry>()(ENCLOSURE_FABRICATION, {
  state: {
    isActive: false,
    activeWorkOrderId: null,
    enclosureMilled: false,
    lastMillingMachineId: null,
  },
})
