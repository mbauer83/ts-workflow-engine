import { WorkflowEngine } from "../../src/application/engine.js";
import { START, startPlace } from "./places/start.js";
import { HARDWARE, hardwarePlace } from "./places/hardware.js";
import { SOFTWARE, softwarePlace } from "./places/software.js";
import { ASSEMBLY, assemblyPlace } from "./places/assembly.js";
import { SHIPPING, shippingPlace } from "./places/shipping.js";
import type { FactoryRegistry } from "./workflow_registry.js";

async function main() {
  const engine = new WorkflowEngine<FactoryRegistry>({
  [START]: startPlace,
  [HARDWARE]: hardwarePlace,
  [SOFTWARE]: softwarePlace,
  [ASSEMBLY]: assemblyPlace,
  [SHIPPING]: shippingPlace
})

  console.log("--- System Offline ---");

  // 1. Initial trigger: Bootstrap the system
  // This sets START.isActive = true.
  // The engine then sees a token in START and fires the transition to Hardware & Software.
  await engine.trigger(START, 'initialize');

  const snapshotAfterStart = engine.getSnapshot();
  console.log("Is Hardware Ready?", snapshotAfterStart[HARDWARE].isActive); // true
  console.log("Is Software Ready?", snapshotAfterStart[SOFTWARE].isActive); // true

  // 2. User Inputs: Process the parallel tracks
  await engine.trigger(HARDWARE, 'cut');
  await engine.trigger(SOFTWARE, 'write');

  const finalSnapshot = engine.getSnapshot();
  console.log("Final target state (SHIPPING) reached?", finalSnapshot[SHIPPING].isActive); // true
}

main().catch(console.error);