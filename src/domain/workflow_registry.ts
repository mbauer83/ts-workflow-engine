type ActiveState<S extends object> = S & { isActive: boolean }

type RegistryEntry<R extends object, K extends keyof R> =
  R[K] extends {
    state: infer S extends object
    targets: readonly (infer Tgt)[]
  }
    ? { state: S; target: Tgt }
    : never

type RawStateOf<R extends object, K extends keyof R> =
  RegistryEntry<R, K> extends { state: infer S extends object } ? S : never

type RawTargetsOf<R extends object, K extends keyof R> =
  RegistryEntry<R, K> extends { target: infer T } ? T : never

type RawInterfaceRoleOf<R extends object, K extends keyof R> =
  R[K] extends { interface: infer Role } ? Role : "internal"

export type InterfaceRoleOf<R extends object, K extends keyof R> =
  RawInterfaceRoleOf<R, K> extends "input" ? "input" : "internal"

export type InputInterfacePlaces<R extends object> = {
  [K in keyof R]: InterfaceRoleOf<R, K> extends "input" ? K : never
}[keyof R]

export type CorePlaces<R extends object> =
  Exclude<keyof R, InputInterfacePlaces<R>>

type HasInputInterfaces<R extends object> =
  [InputInterfacePlaces<R>] extends [never] ? false : true

type InvalidStructureKeys<R extends object> = {
  [K in keyof R]: RegistryEntry<R, K> extends never ? K : never
}[keyof R]

type InvalidTargetKeys<R extends object, K extends keyof R> =
  Exclude<RawTargetsOf<R, K>, Exclude<keyof R, K>>

type InvalidPlaceKeys<R extends object> = {
  [K in keyof R]: InvalidTargetKeys<R, K> extends never ? never : K
}[keyof R]

type InvalidInterfaceRoleKeys<R extends object> = {
  [K in keyof R]: RawInterfaceRoleOf<R, K> extends "internal" | "input" ? never : K
}[keyof R]

type CoreTargetsOf<R extends object, K extends CorePlaces<R>> =
  Extract<RawTargetsOf<R, K>, CorePlaces<R>>

type InputInterfaceTargets<R extends object, K extends InputInterfacePlaces<R>> =
  Extract<RawTargetsOf<R, K>, CorePlaces<R>>

type EntryPlaces<R extends object> = {
  [K in InputInterfacePlaces<R>]: InputInterfaceTargets<R, K>
}[InputInterfacePlaces<R>]

type InvalidInputInterfaceWithoutCoreTargets<R extends object> = {
  [K in InputInterfacePlaces<R>]: InputInterfaceTargets<R, K> extends never ? K : never
}[InputInterfacePlaces<R>]

type InvalidInputInterfaceNonCoreTargets<R extends object> = {
  [K in InputInterfacePlaces<R>]:
    Exclude<Extract<RawTargetsOf<R, K>, keyof R>, CorePlaces<R>> extends never ? never : K
}[InputInterfacePlaces<R>]

type IncomingOfAll<R extends object, K extends keyof R> = {
  [S in keyof R]: K extends Extract<RawTargetsOf<R, S>, keyof R> ? S : never
}[keyof R]

type InvalidInputInterfaceIncoming<R extends object> = {
  [K in InputInterfacePlaces<R>]: IncomingOfAll<R, K> extends never ? never : K
}[InputInterfacePlaces<R>]

type IncomingOfCore<R extends object, K extends CorePlaces<R>> = {
  [S in CorePlaces<R>]: K extends CoreTargetsOf<R, S> ? S : never
}[CorePlaces<R>]

type IsNever<T> = [T] extends [never] ? true : false

type IsUnion<T, U = T> =
  IsNever<T> extends true
    ? false
    : T extends U
      ? [U] extends [T]
        ? false
        : true
      : false

type HasExactlyOne<T> =
  IsNever<T> extends true
    ? false
    : IsUnion<T> extends true
      ? false
      : true

export type SourcePlaces<R extends object> = {
  [K in CorePlaces<R>]: IncomingOfCore<R, K> extends never ? K : never
}[CorePlaces<R>]

export type SinkPlaces<R extends object> = {
  [K in CorePlaces<R>]: CoreTargetsOf<R, K> extends never ? K : never
}[CorePlaces<R>]

type SourcePlace<R extends object> =
  HasExactlyOne<SourcePlaces<R>> extends true ? SourcePlaces<R> : never

type SinkPlace<R extends object> =
  HasExactlyOne<SinkPlaces<R>> extends true ? SinkPlaces<R> : never

type ReachabilityStartPlaces<R extends object> =
  HasInputInterfaces<R> extends true
    ? EntryPlaces<R>
    : Extract<SourcePlace<R>, CorePlaces<R>>

type ExpandForward<
  R extends object,
  Frontier extends CorePlaces<R>,
  Visited extends CorePlaces<R> = never
> =
  [Frontier] extends [never]
    ? Visited
    : ExpandForward<
        R,
        Exclude<CoreTargetsOf<R, Frontier>, Visited | Frontier>,
        Visited | Frontier
      >

type ExpandBackward<
  R extends object,
  Frontier extends CorePlaces<R>,
  Visited extends CorePlaces<R> = never
> =
  [Frontier] extends [never]
    ? Visited
    : ExpandBackward<
        R,
        Exclude<IncomingOfCore<R, Frontier>, Visited | Frontier>,
        Visited | Frontier
      >

type ReachableFromStart<R extends object> =
  ExpandForward<R, Extract<ReachabilityStartPlaces<R>, CorePlaces<R>>>

type CanReachSink<R extends object> =
  ExpandBackward<R, Extract<SinkPlace<R>, CorePlaces<R>>>

type UnreachableFromStart<R extends object> =
  Exclude<CorePlaces<R>, ReachableFromStart<R>>

type NotReachingSink<R extends object> =
  Exclude<CorePlaces<R>, CanReachSink<R>>

type InvalidCorePlaceSet<R extends object> =
  [CorePlaces<R>] extends [never] ? "__missing_core_places__" : never

type InvalidEntryPlaceSet<R extends object> =
  HasInputInterfaces<R> extends true
    ? [EntryPlaces<R>] extends [never]
      ? "__missing_entry_places__"
      : never
    : never

type InvalidSourcePlaceCardinality<R extends object> =
  HasInputInterfaces<R> extends true
    ? never
    : [CorePlaces<R>] extends [never]
      ? never
      : HasExactlyOne<SourcePlaces<R>> extends true
        ? never
        : "__invalid_source_place_count__"

type InvalidSinkPlaceCardinality<R extends object> =
  [CorePlaces<R>] extends [never]
    ? never
    : HasExactlyOne<SinkPlaces<R>> extends true
      ? never
      : "__invalid_sink_place_count__"

type InvalidConnectivity<R extends object> =
  [CorePlaces<R>] extends [never] ? never : UnreachableFromStart<R> | NotReachingSink<R>

type InvalidRegistryKeys<R extends object> =
  | InvalidStructureKeys<R>
  | InvalidPlaceKeys<R>
  | InvalidInterfaceRoleKeys<R>
  | InvalidInputInterfaceWithoutCoreTargets<R>
  | InvalidInputInterfaceNonCoreTargets<R>
  | InvalidInputInterfaceIncoming<R>
  | InvalidCorePlaceSet<R>
  | InvalidEntryPlaceSet<R>
  | InvalidSourcePlaceCardinality<R>
  | InvalidSinkPlaceCardinality<R>
  | InvalidConnectivity<R>

export type RegistryValidation<R extends object> =
  [InvalidRegistryKeys<R>] extends [never] ? true : never

export type WorkflowRegistry<R extends object> =
  RegistryValidation<R> extends true ? R : never

export type AssertWorkflowRegistry<R extends object> = WorkflowRegistry<R>

export type StateOf<R extends object, K extends keyof R> =
  ActiveState<RawStateOf<R, K>>

export type TargetsOf<R extends object, K extends keyof R> =
  Extract<RawTargetsOf<R, K>, keyof R>

export type KeysWithTargets<R extends object> = {
  [K in keyof R]: TargetsOf<R, K> extends never ? never : K
}[keyof R]
