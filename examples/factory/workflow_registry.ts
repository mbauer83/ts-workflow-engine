import type { FACTORY_EVENT_INTAKE, FactoryEventIntakeState } from "./places/environment.js"
import type { ENCLOSURE_FABRICATION, EnclosureFabricationState } from "./places/enclosure_fabrication.js"
import type { FIRMWARE_PREPARATION, FirmwarePreparationState } from "./places/firmware_preparation.js"
import type { FINAL_ASSEMBLY, FinalAssemblyState } from "./places/final_assembly.js"
import type { DISPATCH_READY, DispatchReadyState } from "./places/dispatch_ready.js"

export interface FactoryRegistry {
  [FACTORY_EVENT_INTAKE]: {
    interface: "input"
    state: FactoryEventIntakeState
  }
  [ENCLOSURE_FABRICATION]: {
    state: EnclosureFabricationState
  }
  [FIRMWARE_PREPARATION]: {
    state: FirmwarePreparationState
  }
  [FINAL_ASSEMBLY]: {
    state: FinalAssemblyState
  }
  [DISPATCH_READY]: {
    state: DispatchReadyState
  }
}
