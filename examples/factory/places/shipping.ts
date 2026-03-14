import { definePlace } from "../../../src/domain/place.js"
import type { FactoryRegistry } from "../workflow_registry.js"

export const SHIPPING = Symbol('Shipping')

export type ShippingState = {}

export const shippingPlace = definePlace<FactoryRegistry>()(SHIPPING, {
  state: { isActive: false },
  transitionGuards: {}
})
