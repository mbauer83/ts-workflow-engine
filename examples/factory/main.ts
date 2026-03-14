import { WorkflowEngine } from "../../src/application/engine.js";
import { ENVIRONMENT, environmentPlace } from "./places/environment.js";
import { HARDWARE, hardwarePlace } from "./places/hardware.js";
import { SOFTWARE, softwarePlace } from "./places/software.js";
import { ASSEMBLY, assemblyPlace } from "./places/assembly.js";
import { SHIPPING, shippingPlace } from "./places/shipping.js";
import type { FactoryRegistry } from "./workflow_registry.js";

async function main() {
  const engine = WorkflowEngine.create<FactoryRegistry>()({
    [ENVIRONMENT]: environmentPlace,
    [HARDWARE]: hardwarePlace,
    [SOFTWARE]: softwarePlace,
    [ASSEMBLY]: assemblyPlace,
    [SHIPPING]: shippingPlace,
  })

  console.log("--- System Offline ---");

  console.log("[INPUT] ENVIRONMENT.initialize requestId=init-001 requestedBy=operator")
  await engine.inject(ENVIRONMENT, {
    pending: {
      kind: "initialize",
      requestId: "init-001",
      requestedBy: "operator",
    },
  });

  const snapshotAfterInitialize = engine.getSnapshot();
  console.log("Is Hardware Ready?", snapshotAfterInitialize[HARDWARE].isActive); // true
  console.log("Is Software Ready?", snapshotAfterInitialize[SOFTWARE].isActive); // true

  console.log("[INPUT] ENVIRONMENT.cut jobId=hw-42 thicknessMm=8")
  await engine.inject(ENVIRONMENT, {
    pending: {
      kind: "cut",
      jobId: "hw-42",
      thicknessMm: 8,
    },
  });

  const snapshotAfterCut = engine.getSnapshot();
  console.log("Hardware metalCut set?", snapshotAfterCut[HARDWARE].metalCut); // true
  console.log("Hardware lastCutJobId", snapshotAfterCut[HARDWARE].lastCutJobId); // hw-42

  console.log("[INPUT] ENVIRONMENT.write jobId=sw-42 branch=main")
  await engine.inject(ENVIRONMENT, {
    pending: {
      kind: "write",
      jobId: "sw-42",
      branch: "main",
    },
  });

  const snapshotAfterWrite = engine.getSnapshot();
  console.log("Software codeWritten set?", snapshotAfterWrite[SOFTWARE].codeWritten); // true
  console.log("Software lastWriteJobId", snapshotAfterWrite[SOFTWARE].lastWriteJobId); // sw-42

  const finalSnapshot = engine.getSnapshot();
  console.log("Final target state (SHIPPING) reached?", finalSnapshot[SHIPPING].isActive); // true
}

await main();