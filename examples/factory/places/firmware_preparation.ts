import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"

export const FIRMWARE_PREPARATION = Symbol("firmware_preparation")

export type FirmwarePreparationState = {
  activeWorkOrderId: string | null
  firmwarePackageSigned: boolean
  firmwareVersion: string | null
}

export const firmwarePreparationPlace = definePlace<FactoryRegistry>()(FIRMWARE_PREPARATION, {
  state: {
    isActive: false,
    activeWorkOrderId: null,
    firmwarePackageSigned: false,
    firmwareVersion: null,
  },
})
