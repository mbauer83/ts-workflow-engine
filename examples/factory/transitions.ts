import { defineTransition } from "../../src/domain/transition.js"
import type { FactoryRegistry } from "./workflow_registry.js"
import { FINAL_ASSEMBLY } from "./places/final_assembly.js"
import { FACTORY_EVENT_INTAKE } from "./places/environment.js"
import { ENCLOSURE_FABRICATION } from "./places/enclosure_fabrication.js"
import { DISPATCH_READY } from "./places/dispatch_ready.js"
import { FIRMWARE_PREPARATION } from "./places/firmware_preparation.js"

const defineFactoryTransition = defineTransition<FactoryRegistry>()

const onWorkOrderReleaseFabricateEnclosureAndPrepareFirmware = defineFactoryTransition(
  Symbol("on_work_order_release_fabricate_enclosure_and_prepare_firmware"),
  {
    inputPlaces: [FACTORY_EVENT_INTAKE],
    outputPlaces: [ENCLOSURE_FABRICATION, FIRMWARE_PREPARATION],
    priority: 10,
    guard: inputs => inputs[FACTORY_EVENT_INTAKE].pendingEvent?.type === "work_order_released",
    effects: {
      [ENCLOSURE_FABRICATION]: inputs => {
        const pendingEvent = inputs[FACTORY_EVENT_INTAKE].pendingEvent
        if (pendingEvent?.type !== "work_order_released") return {}

        return {
          activeWorkOrderId: pendingEvent.workOrderId,
          enclosureMilled: false,
          lastMillingMachineId: null,
        }
      },
      [FIRMWARE_PREPARATION]: inputs => {
        const pendingEvent = inputs[FACTORY_EVENT_INTAKE].pendingEvent
        if (pendingEvent?.type !== "work_order_released") return {}

        return {
          activeWorkOrderId: pendingEvent.workOrderId,
          firmwarePackageSigned: false,
          firmwareVersion: null,
        }
      },
    },
  }
)

const onEnclosureMillingCompletedRecordFabrication = defineFactoryTransition(
  Symbol("on_enclosure_milling_completed_record_fabrication"),
  {
    inputPlaces: [FACTORY_EVENT_INTAKE, ENCLOSURE_FABRICATION],
    outputPlaces: [ENCLOSURE_FABRICATION],
    priority: 6,
    guard: inputs => {
      const pendingEvent = inputs[FACTORY_EVENT_INTAKE].pendingEvent
      return pendingEvent?.type === "enclosure_milling_completed"
        && pendingEvent.workOrderId === inputs[ENCLOSURE_FABRICATION].activeWorkOrderId
    },
    effects: {
      [ENCLOSURE_FABRICATION]: inputs => {
        const pendingEvent = inputs[FACTORY_EVENT_INTAKE].pendingEvent
        if (pendingEvent?.type !== "enclosure_milling_completed") return {}

        return {
          enclosureMilled: true,
          lastMillingMachineId: pendingEvent.machineId,
        }
      },
    },
  }
)

const onFirmwarePackageSignedRecordPreparation = defineFactoryTransition(
  Symbol("on_firmware_package_signed_record_preparation"),
  {
    inputPlaces: [FACTORY_EVENT_INTAKE, FIRMWARE_PREPARATION],
    outputPlaces: [FIRMWARE_PREPARATION],
    priority: 6,
    guard: inputs => {
      const pendingEvent = inputs[FACTORY_EVENT_INTAKE].pendingEvent
      return pendingEvent?.type === "firmware_package_signed"
        && pendingEvent.workOrderId === inputs[FIRMWARE_PREPARATION].activeWorkOrderId
    },
    effects: {
      [FIRMWARE_PREPARATION]: inputs => {
        const pendingEvent = inputs[FACTORY_EVENT_INTAKE].pendingEvent
        if (pendingEvent?.type !== "firmware_package_signed") return {}

        return {
          firmwarePackageSigned: true,
          firmwareVersion: pendingEvent.firmwareVersion,
        }
      },
    },
  }
)

const onEnclosureFabricatedAndFirmwareSignedPerformFinalAssembly = defineFactoryTransition(
  Symbol("on_enclosure_fabricated_and_firmware_signed_perform_final_assembly"),
  {
    inputPlaces: [ENCLOSURE_FABRICATION, FIRMWARE_PREPARATION],
    outputPlaces: [FINAL_ASSEMBLY],
    priority: 12,
    guard: inputs =>
      inputs[ENCLOSURE_FABRICATION].enclosureMilled
      && inputs[FIRMWARE_PREPARATION].firmwarePackageSigned
      && inputs[ENCLOSURE_FABRICATION].activeWorkOrderId !== null
      && inputs[ENCLOSURE_FABRICATION].activeWorkOrderId
      === inputs[FIRMWARE_PREPARATION].activeWorkOrderId,
    effects: {
      [FINAL_ASSEMBLY]: inputs => ({
        assembledWorkOrderId: inputs[ENCLOSURE_FABRICATION].activeWorkOrderId,
      }),
    },
  }
)

const onFinalAssemblyCompletedMarkDispatchReady = defineFactoryTransition(
  Symbol("on_final_assembly_completed_mark_dispatch_ready"),
  {
    inputPlaces: [FINAL_ASSEMBLY],
    outputPlaces: [DISPATCH_READY],
    priority: 1,
    effects: {
      [DISPATCH_READY]: inputs => ({
        dispatchedWorkOrderId: inputs[FINAL_ASSEMBLY].assembledWorkOrderId,
      }),
    },
  }
)

export const factoryTransitions = {
  onWorkOrderReleaseFabricateEnclosureAndPrepareFirmware,
  onEnclosureMillingCompletedRecordFabrication,
  onFirmwarePackageSignedRecordPreparation,
  onEnclosureFabricatedAndFirmwareSignedPerformFinalAssembly,
  onFinalAssemblyCompletedMarkDispatchReady,
} as const
