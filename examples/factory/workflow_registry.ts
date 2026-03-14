import type { WorkflowRegistry } from "../../src/domain/workflow_registry.js";
import type { ASSEMBLY, assemblyActions, AssemblyState } from "./places/assembly.js";
import type { HARDWARE, hardwareActions, HardwareState } from "./places/hardware.js";
import type { SHIPPING, shippingActions, ShippingState } from "./places/shipping.js";
import type { SOFTWARE, softwareActions, SoftwareState } from "./places/software.js";
import type { START, startActions, StartState } from "./places/start.js";

export interface FactoryRegistry {
  [START]: { state: StartState; actions: typeof startActions; targets: [typeof HARDWARE, typeof SOFTWARE] };
  [HARDWARE]: { state: HardwareState; actions: typeof hardwareActions; targets: [typeof ASSEMBLY] };
  [SOFTWARE]: { state: SoftwareState; actions: typeof softwareActions; targets: [typeof ASSEMBLY] };
  [ASSEMBLY]: { state: AssemblyState; actions: typeof assemblyActions; targets: [typeof SHIPPING] };
  [SHIPPING]: { state: ShippingState; actions: typeof shippingActions; targets: [] };
}

export type ActiveWorkflowRegistry = WorkflowRegistry<FactoryRegistry>
