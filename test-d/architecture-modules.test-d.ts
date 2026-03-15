import { expectType } from "tsd"
import { resolveWorkflowEngineConfiguration } from "../src/application/workflow_engine/configuration.js"
import type { InterfaceBoundarySoundnessIssues } from "../src/domain/workflow_registry/soundness/interface_boundary_soundness.js"
import type { StructuralSoundnessIssues } from "../src/domain/workflow_registry/soundness/structural_soundness.js"
import type { TopologySoundnessIssues } from "../src/domain/workflow_registry/soundness/topology_soundness.js"

declare const ENV: unique symbol
declare const STEP: unique symbol
declare const END: unique symbol

type ExamplePlaces = {
  [ENV]: { interface: "input"; state: { pending: string | null } }
  [STEP]: { state: { done: boolean } }
  [END]: { state: {} }
}

type ExampleTransitions = {
  envToStep: {
    inputPlaces: [typeof ENV]
    outputPlaces: [typeof STEP]
    priority: 2
  }
  stepToEnd: {
    inputPlaces: [typeof STEP]
    outputPlaces: [typeof END]
    priority: 1
  }
}

expectType<{ stabilizationTickLimit: number }>(resolveWorkflowEngineConfiguration())
expectType<{ stabilizationTickLimit: number }>(
  resolveWorkflowEngineConfiguration({ stabilizationTickLimit: 50 })
)

expectType<StructuralSoundnessIssues<ExamplePlaces, ExampleTransitions>>(
  null as unknown as StructuralSoundnessIssues<ExamplePlaces, ExampleTransitions>
)

expectType<InterfaceBoundarySoundnessIssues<ExamplePlaces, ExampleTransitions>>(
  null as unknown as InterfaceBoundarySoundnessIssues<ExamplePlaces, ExampleTransitions>
)

expectType<TopologySoundnessIssues<ExamplePlaces, ExampleTransitions>>(
  null as unknown as TopologySoundnessIssues<ExamplePlaces, ExampleTransitions>
)
