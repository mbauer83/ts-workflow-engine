import type { CorePlaces, HasInputInterfaces } from "../place_catalog.js"
import type {
  NotReachingSink,
  SinkPlaces,
  SourcePlaces,
  UnreachableFromStart,
} from "../net_topology.js"
import type { ValidationIssue } from "./issue.js"
import type { HasExactlyOne } from "../type_algebra.js"

type CorePlaceSetIssue<Places extends object> =
  [CorePlaces<Places>] extends [never]
    ? ValidationIssue<"missing_core_places">
    : never

type InvalidSourcePlaceCardinalityIssue<Places extends object, Transitions extends object> =
  HasInputInterfaces<Places> extends true
    ? never
    : [CorePlaces<Places>] extends [never]
      ? never
      : HasExactlyOne<SourcePlaces<Places, Transitions>> extends true
        ? never
        : ValidationIssue<"invalid_source_place_count", {
            sourcePlaces: SourcePlaces<Places, Transitions>
          }>

type InvalidSinkPlaceCardinalityIssue<Places extends object, Transitions extends object> =
  [CorePlaces<Places>] extends [never]
    ? never
    : HasExactlyOne<SinkPlaces<Places, Transitions>> extends true
      ? never
      : ValidationIssue<"invalid_sink_place_count", {
          sinkPlaces: SinkPlaces<Places, Transitions>
        }>

type UnreachableFromStartIssue<Places extends object, Transitions extends object> =
  [UnreachableFromStart<Places, Transitions>] extends [never]
    ? never
    : ValidationIssue<"core_place_unreachable_from_start", {
        places: UnreachableFromStart<Places, Transitions>
      }>

type NotReachingSinkIssue<Places extends object, Transitions extends object> =
  [NotReachingSink<Places, Transitions>] extends [never]
    ? never
    : ValidationIssue<"core_place_cannot_reach_sink", {
        places: NotReachingSink<Places, Transitions>
      }>

export type TopologySoundnessIssues<Places extends object, Transitions extends object> =
  | CorePlaceSetIssue<Places>
  | InvalidSourcePlaceCardinalityIssue<Places, Transitions>
  | InvalidSinkPlaceCardinalityIssue<Places, Transitions>
  | UnreachableFromStartIssue<Places, Transitions>
  | NotReachingSinkIssue<Places, Transitions>
