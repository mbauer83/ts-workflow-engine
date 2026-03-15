import { DISPATCH_READY, dispatchReadyPlace } from "../../../examples/factory/places/dispatch_ready.js"
import { FACTORY_EVENT_INTAKE, factoryEventIntakePlace } from "../../../examples/factory/places/environment.js"
import { ENCLOSURE_FABRICATION, enclosureFabricationPlace } from "../../../examples/factory/places/enclosure_fabrication.js"
import { FINAL_ASSEMBLY, finalAssemblyPlace } from "../../../examples/factory/places/final_assembly.js"
import { FIRMWARE_PREPARATION, firmwarePreparationPlace } from "../../../examples/factory/places/firmware_preparation.js"
import { factoryTransitions } from "../../../examples/factory/transitions.js"

export const places = {
  [FACTORY_EVENT_INTAKE]: factoryEventIntakePlace,
  [ENCLOSURE_FABRICATION]: enclosureFabricationPlace,
  [FIRMWARE_PREPARATION]: firmwarePreparationPlace,
  [FINAL_ASSEMBLY]: finalAssemblyPlace,
  [DISPATCH_READY]: dispatchReadyPlace,
} as const

export const transitions = factoryTransitions

export const workflowNetDiagramSource = {
  title: "Factory workflow net",
  places,
  transitions,
} as const
