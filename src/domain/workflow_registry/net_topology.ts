import type {
  CorePlaces,
  HasInputInterfaces,
  InputInterfacePlaces,
} from "./place_catalog.js"
import type { TargetsOf } from "./transition_catalog.js"
import type { HasExactlyOne } from "./type_algebra.js"

type CoreTargetsOf<
  Places extends object,
  Transitions extends object,
  K extends CorePlaces<Places>,
> = Extract<TargetsOf<Places, Transitions, K>, CorePlaces<Places>>

type InputInterfaceTargets<
  Places extends object,
  Transitions extends object,
  K extends InputInterfacePlaces<Places>,
> = Extract<TargetsOf<Places, Transitions, K>, CorePlaces<Places>>

type EntryPlaces<Places extends object, Transitions extends object> = {
  [K in InputInterfacePlaces<Places>]: InputInterfaceTargets<Places, Transitions, K>
}[InputInterfacePlaces<Places>]

type IncomingOfAll<
  Places extends object,
  Transitions extends object,
  K extends keyof Places,
> = {
  [S in keyof Places]: K extends TargetsOf<Places, Transitions, S> ? S : never
}[keyof Places]

type IncomingOfCore<
  Places extends object,
  Transitions extends object,
  K extends CorePlaces<Places>,
> = {
  [S in CorePlaces<Places>]: K extends CoreTargetsOf<Places, Transitions, S> ? S : never
}[CorePlaces<Places>]

export type SourcePlaces<Places extends object, Transitions extends object> = {
  [K in CorePlaces<Places>]: IncomingOfCore<Places, Transitions, K> extends never ? K : never
}[CorePlaces<Places>]

export type SinkPlaces<Places extends object, Transitions extends object> = {
  [K in CorePlaces<Places>]: CoreTargetsOf<Places, Transitions, K> extends never ? K : never
}[CorePlaces<Places>]

type SourcePlace<Places extends object, Transitions extends object> =
  HasExactlyOne<SourcePlaces<Places, Transitions>> extends true
    ? SourcePlaces<Places, Transitions>
    : never

type SinkPlace<Places extends object, Transitions extends object> =
  HasExactlyOne<SinkPlaces<Places, Transitions>> extends true
    ? SinkPlaces<Places, Transitions>
    : never

type ReachabilityStartPlaces<Places extends object, Transitions extends object> =
  HasInputInterfaces<Places> extends true
    ? EntryPlaces<Places, Transitions>
    : Extract<SourcePlace<Places, Transitions>, CorePlaces<Places>>

type ExpandForward<
  Places extends object,
  Transitions extends object,
  Frontier extends CorePlaces<Places>,
  Visited extends CorePlaces<Places> = never,
> =
  [Frontier] extends [never]
    ? Visited
    : ExpandForward<
        Places,
        Transitions,
        Exclude<CoreTargetsOf<Places, Transitions, Frontier>, Visited | Frontier>,
        Visited | Frontier
      >

type ExpandBackward<
  Places extends object,
  Transitions extends object,
  Frontier extends CorePlaces<Places>,
  Visited extends CorePlaces<Places> = never,
> =
  [Frontier] extends [never]
    ? Visited
    : ExpandBackward<
        Places,
        Transitions,
        Exclude<IncomingOfCore<Places, Transitions, Frontier>, Visited | Frontier>,
        Visited | Frontier
      >

type ReachableFromStart<Places extends object, Transitions extends object> =
  ExpandForward<
    Places,
    Transitions,
    Extract<ReachabilityStartPlaces<Places, Transitions>, CorePlaces<Places>>
  >

type CanReachSink<Places extends object, Transitions extends object> =
  ExpandBackward<
    Places,
    Transitions,
    Extract<SinkPlace<Places, Transitions>, CorePlaces<Places>>
  >

export type UnreachableFromStart<Places extends object, Transitions extends object> =
  Exclude<CorePlaces<Places>, ReachableFromStart<Places, Transitions>>

export type NotReachingSink<Places extends object, Transitions extends object> =
  Exclude<CorePlaces<Places>, CanReachSink<Places, Transitions>>

export type {
  EntryPlaces,
  IncomingOfAll,
  InputInterfaceTargets,
}
