import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"

export const FACTORY_EVENT_INTAKE = Symbol("factory_event_intake")

export type FactoryEvent =
  | {
      type: "work_order_released"
      workOrderId: string
      productSku: string
      releasedBy: string
    }
  | {
      type: "enclosure_milling_completed"
      workOrderId: string
      machineId: string
      panelThicknessMm: number
    }
  | {
      type: "firmware_package_signed"
      workOrderId: string
      firmwareVersion: string
      signedBy: string
    }

export type FactoryEventIntakeState = {
  pendingEvent: FactoryEvent | null
}

export const factoryEventIntakePlace = definePlace<FactoryRegistry>()(FACTORY_EVENT_INTAKE, {
  interfaceRole: "input",
  state: { isActive: false, pendingEvent: null },
})
