import type {
  CorePlaces,
  HasInputInterfaces,
  InputInterfacePlaces,
} from "../place_catalog.js"
import type { TargetsOf } from "../transition_catalog.js"
import type {
  EntryPlaces,
  IncomingOfAll,
  InputInterfaceTargets,
} from "../net_topology.js"
import type { ValidationIssue } from "./issue.js"

type InputInterfaceWithoutCoreTargetsIssue<
  Places extends object,
  Transitions extends object,
> = {
  [K in InputInterfacePlaces<Places>]:
    InputInterfaceTargets<Places, Transitions, K> extends never
      ? ValidationIssue<"input_interface_without_core_targets", { place: K }>
      : never
}[InputInterfacePlaces<Places>]

type InputInterfaceNonCoreTargetsIssue<
  Places extends object,
  Transitions extends object,
> = {
  [K in InputInterfacePlaces<Places>]:
    Exclude<TargetsOf<Places, Transitions, K>, CorePlaces<Places>> extends never
      ? never
      : ValidationIssue<"input_interface_targets_non_core_places", {
          place: K
          targets: Exclude<TargetsOf<Places, Transitions, K>, CorePlaces<Places>>
        }>
}[InputInterfacePlaces<Places>]

type InputInterfaceIncomingIssue<Places extends object, Transitions extends object> = {
  [K in InputInterfacePlaces<Places>]:
    IncomingOfAll<Places, Transitions, K> extends never
      ? never
      : ValidationIssue<"input_interface_has_incoming_edges", {
          place: K
          incomingFrom: IncomingOfAll<Places, Transitions, K>
        }>
}[InputInterfacePlaces<Places>]

type MissingEntryPlaceIssue<Places extends object, Transitions extends object> =
  HasInputInterfaces<Places> extends true
    ? [EntryPlaces<Places, Transitions>] extends [never]
      ? ValidationIssue<"missing_entry_places">
      : never
    : never

export type InterfaceBoundarySoundnessIssues<
  Places extends object,
  Transitions extends object,
> =
  | InputInterfaceWithoutCoreTargetsIssue<Places, Transitions>
  | InputInterfaceNonCoreTargetsIssue<Places, Transitions>
  | InputInterfaceIncomingIssue<Places, Transitions>
  | MissingEntryPlaceIssue<Places, Transitions>
