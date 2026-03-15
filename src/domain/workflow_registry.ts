export type {
  CorePlaces,
  InputInterfacePlaces,
  InputPlacesOfTransition,
  InterfaceRoleOf,
  InvalidRegistryIssues,
  KeysWithTargets,
  OutputPlacesOfTransition,
  RegistryValidation,
  SinkPlaces,
  SourcePlaces,
  StateOf,
  TargetsOf,
  TransitionPriorityOf,
  ValidationIssue,
} from "./workflow_registry/index.js"

import type { RegistryValidation as WorkflowRegistryValidation } from "./workflow_registry/index.js"

export type WorkflowRegistry<Places extends object, Transitions extends object> =
  WorkflowRegistryValidation<Places, Transitions> extends true
    ? { places: Places; transitions: Transitions }
    : WorkflowRegistryValidation<Places, Transitions>

export type AssertWorkflowRegistry<Places extends object, Transitions extends object> =
  WorkflowRegistry<Places, Transitions>
