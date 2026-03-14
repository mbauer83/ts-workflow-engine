import type { WorkflowPlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"

export const SHIPPING = Symbol('Shipping')

export type ShippingState = { isActive: boolean }

export const shippingActions = {}

export const shippingPlace: WorkflowPlace<FactoryRegistry, typeof SHIPPING> = {
  name: SHIPPING,
  state: { isActive: false },
  actions: shippingActions,
  preconditions: {} as any
}
