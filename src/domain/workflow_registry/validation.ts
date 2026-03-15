import type { InterfaceBoundarySoundnessIssues } from "./soundness/interface_boundary_soundness.js"
import type { StructuralSoundnessIssues } from "./soundness/structural_soundness.js"
import type { TopologySoundnessIssues } from "./soundness/topology_soundness.js"

export type InvalidRegistryIssues<Places extends object, Transitions extends object> =
  | StructuralSoundnessIssues<Places, Transitions>
  | InterfaceBoundarySoundnessIssues<Places, Transitions>
  | TopologySoundnessIssues<Places, Transitions>

export type RegistryValidation<Places extends object, Transitions extends object> =
  [InvalidRegistryIssues<Places, Transitions>] extends [never]
    ? true
    : InvalidRegistryIssues<Places, Transitions>
