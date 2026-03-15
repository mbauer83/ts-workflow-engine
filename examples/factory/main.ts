import { WorkflowEngine } from "../../src/application/engine.js"
import { FINAL_ASSEMBLY, finalAssemblyPlace } from "./places/final_assembly.js"
import { FACTORY_EVENT_INTAKE, factoryEventIntakePlace } from "./places/environment.js"
import { ENCLOSURE_FABRICATION, enclosureFabricationPlace } from "./places/enclosure_fabrication.js"
import { DISPATCH_READY, dispatchReadyPlace } from "./places/dispatch_ready.js"
import { FIRMWARE_PREPARATION, firmwarePreparationPlace } from "./places/firmware_preparation.js"
import { factoryTransitions } from "./transitions.js"
import type { FactoryRegistry } from "./workflow_registry.js"

async function main() {
  const engine = WorkflowEngine.create<FactoryRegistry>()({
    places: {
      [FACTORY_EVENT_INTAKE]: factoryEventIntakePlace,
      [ENCLOSURE_FABRICATION]: enclosureFabricationPlace,
      [FIRMWARE_PREPARATION]: firmwarePreparationPlace,
      [FINAL_ASSEMBLY]: finalAssemblyPlace,
      [DISPATCH_READY]: dispatchReadyPlace,
    },
    transitions: factoryTransitions,
  })

  console.log("--- Smart Control Unit Factory (Idle) ---")

  console.log("[EVENT] work_order_released workOrderId=wo-2026-001 productSku=SCU-XL")
  await engine.inject(FACTORY_EVENT_INTAKE, {
    pendingEvent: {
      type: "work_order_released",
      workOrderId: "wo-2026-001",
      productSku: "SCU-XL",
      releasedBy: "erp.system",
    },
  })

  const snapshotAfterFork = engine.getSnapshot()
  console.log("Parallel enclosure workstream active?", snapshotAfterFork[ENCLOSURE_FABRICATION].isActive)
  console.log("Parallel firmware workstream active?", snapshotAfterFork[FIRMWARE_PREPARATION].isActive)

  console.log("[EVENT] enclosure_milling_completed workOrderId=wo-2026-001 machineId=cnc-17")
  await engine.inject(FACTORY_EVENT_INTAKE, {
    pendingEvent: {
      type: "enclosure_milling_completed",
      workOrderId: "wo-2026-001",
      machineId: "cnc-17",
      panelThicknessMm: 8,
    },
  })

  const snapshotAfterMilling = engine.getSnapshot()
  console.log("Enclosure milled?", snapshotAfterMilling[ENCLOSURE_FABRICATION].enclosureMilled)
  console.log("Last milling machine", snapshotAfterMilling[ENCLOSURE_FABRICATION].lastMillingMachineId)
  console.log("Dispatch already ready?", snapshotAfterMilling[DISPATCH_READY].isActive)

  console.log("[EVENT] firmware_package_signed workOrderId=wo-2026-001 firmwareVersion=2026.3.0")
  await engine.inject(FACTORY_EVENT_INTAKE, {
    pendingEvent: {
      type: "firmware_package_signed",
      workOrderId: "wo-2026-001",
      firmwareVersion: "2026.3.0",
      signedBy: "ci.release",
    },
  })

  const snapshotAfterSynchronization = engine.getSnapshot()
  console.log("Firmware package signed?", snapshotAfterSynchronization[FIRMWARE_PREPARATION].firmwarePackageSigned)
  console.log("Firmware version", snapshotAfterSynchronization[FIRMWARE_PREPARATION].firmwareVersion)
  console.log("Final assembly captured work order", snapshotAfterSynchronization[FINAL_ASSEMBLY].assembledWorkOrderId)

  const finalSnapshot = engine.getSnapshot()
  console.log("Final target state (DISPATCH_READY) reached?", finalSnapshot[DISPATCH_READY].isActive)
  console.log("Dispatched work order", finalSnapshot[DISPATCH_READY].dispatchedWorkOrderId)
}

await main()