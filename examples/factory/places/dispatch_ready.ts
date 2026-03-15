import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"

export const DISPATCH_READY = Symbol("dispatch_ready")

export type DispatchReadyState = {
  dispatchedWorkOrderId: string | null
}

export const dispatchReadyPlace = definePlace<FactoryRegistry>()(DISPATCH_READY, {
  state: {
    isActive: false,
    dispatchedWorkOrderId: null,
  },
})
