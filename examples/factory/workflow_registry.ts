import type { AssertWorkflowRegistry, RegistryValidation } from "../../src/domain/workflow_registry.js"
import type { ASSEMBLY, AssemblyState } from "./places/assembly.js"
import type { ENVIRONMENT, EnvironmentState } from "./places/environment.js"
import type { HARDWARE, HardwareState } from "./places/hardware.js"
import type { SHIPPING, ShippingState } from "./places/shipping.js"
import type { SOFTWARE, SoftwareState } from "./places/software.js"

export interface FactoryRegistry {
  [ENVIRONMENT]: {
    interface: "input"
    state: EnvironmentState
    targets: [typeof HARDWARE, typeof SOFTWARE]
  }
  [HARDWARE]: {
    state: HardwareState
    targets: [typeof ASSEMBLY]
  }
  [SOFTWARE]: {
    state: SoftwareState
    targets: [typeof ASSEMBLY]
  }
  [ASSEMBLY]: {
    state: AssemblyState
    targets: [typeof SHIPPING]
  }
  [SHIPPING]: {
    state: ShippingState
    targets: []
  }
}

const _factoryRegistryValidation: RegistryValidation<FactoryRegistry> = true

export type ActiveWorkflowRegistry = AssertWorkflowRegistry<FactoryRegistry>
